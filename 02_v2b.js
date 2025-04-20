/* ------------------------------------------------------------------
   02_v2b.js  – same behaviour as your “good” v2, but avoids
                late‑stage overlaps by using real sizes + grid fallback
   ------------------------------------------------------------------ */

   document.addEventListener("DOMContentLoaded", () => {

    const poemContainer = document.getElementById("poem-container");
  
    /* ---------- poem data --------------------------------------------- */
    const poem = [
      { text:"When past the threshold of the Gate we were,",            linkWord:"threshold" },
      { text:"whose use the tangled love of souls impairs,",            linkWord:"tangled love" },
      { text:"because it makes the crooked path seem straight,",        linkWord:"crooked" },
      { text:"'t was by its sound I knew that it had closed;",          linkWord:"closed" },
      { text:"and, had I turned mine eyes in its direction,",           linkWord:"eyes" },
      { text:"what would have fittingly excused my fault?",             linkWord:"fault" },
      { text:"We mounted through a fissure in the rock,",               linkWord:"fissure" },
      { text:"which moved about to this side and to that,",             linkWord:"moved" },
      { text:"as moves a wave that flees and draweth near.",            linkWord:"wave" },
      { text:"\"A little skill must here be used by us,\"",             linkWord:"skill" },
      { text:"my Leader then began, \"in keeping close,",               linkWord:"close" },
      { text:"now here, now there, to the receding side.\"",            linkWord:"now there" },
      { text:"This caused our steps to be so slow and short,",          linkWord:"slow" },
      { text:"that to her bed the waning moon had gone",                linkWord:"waning moon" },
      { text:"to rest herself again, ere we had issued",                linkWord:"issued" },
      { text:"forth from that needle's eye; but when set free",         linkWord:"needle's" },
      { text:"we were, and in the open up above,",                      linkWord:"open" },
      { text:"where back the Mountain's side recedes, I, weary,",       linkWord:"recedes" },
      { text:"and both of us uncertain of our way,",                    linkWord:"uncertain" },
      { text:"stopped short upon a level place up there,",              linkWord:"level place" },
      { text:"more lonely than are roads through desert lands." }
    ];
  
    /* ---------- helpers ----------------------------------------------- */
    const occupied = [];
    let   idx       = 0;
  
    /* invisible measurer – gives real width/height of any line */
    const measurer = document.createElement("span");
    measurer.style.position   = "absolute";
    measurer.style.visibility = "hidden";
    measurer.style.whiteSpace = "nowrap";
    poemContainer.appendChild(measurer);
    function measure(txt){
      measurer.textContent = txt;
      return { w: measurer.offsetWidth, h: measurer.offsetHeight };
    }
  
    function boxSize(){
      return { w: poemContainer.clientWidth,
               h: poemContainer.clientHeight };
    }
  
    function collide(a,b,buf=20){
      return !(a.x+a.w+buf<b.x || a.x>b.x+b.w+buf ||
               a.y+a.h+buf<b.y || a.y>b.y+b.h+buf);
    }
  
    /* ---------- find position – updated -------------------------------- */
    function findSpot(srcX,srcY,w,h){
      const margin = 30;
      const { w:boxW, h:boxH } = boxSize();
      const minD = 80;
      const maxD = Math.min(300, Math.min(boxW,boxH)*0.6);
      const tries = 50;
  
      for(let t=0;t<tries;t++){
        /* biased random angle */
        let ang;
        if(Math.random()<0.7){
          const b=(Math.random()*60-30)*Math.PI/180;
          ang = Math.random()<0.5?b:Math.PI+b;
        } else ang=Math.random()*Math.PI*2;
  
        const dist = minD + Math.random()*(maxD-minD);
        let x = srcX + Math.cos(ang)*dist - w/2;
        let y = srcY + Math.sin(ang)*dist - h/2;
        x = Math.max(margin, Math.min(boxW-w-margin, x));
        y = Math.max(margin, Math.min(boxH-h-margin, y));
  
        const rect={x,y,w,h};
        if(!occupied.some(r=>collide(rect,r))) return rect;
      }
  
      /* grid fallback (5×5) pick emptiest cell -------------------------- */
      const G=5, cellW=boxW/G, cellH=boxH/G, count=[];
      for(let i=0;i<G;i++){count[i]=Array(G).fill(0);}
      occupied.forEach(r=>{
        const cx=Math.min(G-1,Math.floor((r.x+r.w/2)/cellW));
        const cy=Math.min(G-1,Math.floor((r.y+r.h/2)/cellH));
        count[cx][cy]++;
      });
  
      let best={c:Infinity,x:0,y:0};
      for(let i=0;i<G;i++)for(let j=0;j<G;j++){
        if(count[i][j]<best.c){
          best={c:count[i][j],
                x:i*cellW + Math.random()*(cellW-w-20)+10,
                y:j*cellH+ Math.random()*(cellH-h-20)+10};
        }
      }
      best.x=Math.max(margin,Math.min(boxW-w-margin,best.x));
      best.y=Math.max(margin,Math.min(boxH-h-margin,best.y));
      return best;
    }
  
    /* ---------- create line + link ------------------------------------- */
    function newLine(data,x,y){
      const div=document.createElement("div");
      div.className="poem-line hidden";
      div.style.left=`${x}px`; div.style.top=`${y}px`; div.style.zIndex="1";
  
      if(data.linkWord && idx<poem.length-1){
        const re=new RegExp(`(\\b${data.linkWord}\\b)`,"i");
        div.innerHTML=data.text.replace(
          re,`<span class="line-link" data-i="${idx}">$1</span>`
        );
      } else div.textContent=data.text;
  
      poemContainer.appendChild(div);
      requestAnimationFrame(()=>div.classList.remove("hidden"));
  
      occupied.push({x,y,w:div.offsetWidth,h:div.offsetHeight});
      const link=div.querySelector(".line-link");
      if(link) linkHandler(link,div);
      return div;
    }
  
    /* ---------- connector ---------------------------------------------- */
    function connect(x1,y1,x2,y2){
      const bar=document.createElement("div");
      bar.className="connecting-line";
      bar.style.transition=`width 1200ms ease-out`;
      const len=Math.hypot(x2-x1,y2-y1);
      bar.style.left=`${x1}px`;
      bar.style.top =`${y1}px`;
      bar.style.transform=`rotate(${Math.atan2(y2-y1,x2-x1)*180/Math.PI}deg)`;
      poemContainer.appendChild(bar);
      requestAnimationFrame(()=>bar.style.width=`${len}px`);
    }
  
    function linkHandler(link,div){
      link.addEventListener("click",e=>{
        e.preventDefault();e.stopPropagation();
        const rect=link.getBoundingClientRect();
        const cRect=poemContainer.getBoundingClientRect();
        const fromX=rect.left-cRect.left+rect.width/2;
        const fromY=rect.top -cRect.top +rect.height/2;
  
        idx++;
        const next=poem[idx];
        const size=measure(next.text);
        const spot=findSpot(fromX,fromY,size.w,size.h);
        const nxtDiv=newLine(next,spot.x,spot.y);
  
        /* connect after it’s in DOM */
        const r=nxtDiv.getBoundingClientRect();
        const toX=r.left-cRect.left+r.width/2;
        const toY=r.top -cRect.top +r.height/2;
        connect(fromX,fromY,toX,toY);
      });
    }
  
    /* ---------- first line (top‑centre) --------------------------------- */
    const size0=measure(poem[0].text);
    const pos0={x:(boxSize().w-size0.w)/2, y:20};
    newLine(poem[0],pos0.x,pos0.y);
  
  });