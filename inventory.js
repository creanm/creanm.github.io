/* -----------------------------------------------------------
   inventory.js
   -----------------------------------------------------------
   Persistent list +   two “clear” modes + optional nav button
   ----------------------------------------------------------- */

   const STORAGE_KEY = "pickedUpItems";
   const MODE_KEY    = "inventoryMode";      // set to "imagination" elsewhere
   
   /* ------------ grab DOM ------------ */
   const h2       = document.querySelector("h2");
   const ul       = document.getElementById("list");
   const resetBtn = document.getElementById("resetBtn");
   const guideBtn = document.getElementById("guideBtn");
   
   const modal    = document.getElementById("modal");
   const modalTxt = document.getElementById("modalText");
   const yesBtn   = document.getElementById("yesBtn");
   const noBtn    = document.getElementById("noBtn");
   
   /* ------------ mode check ---------- */
   const imaginationMode = localStorage.getItem(MODE_KEY) === "imagination";
   if (imaginationMode) {
     h2.textContent            = "Imagination";
     resetBtn.textContent      = "clear imagination";
     modalTxt.textContent      = "Clear your imagination?";
     guideBtn.style.display    = "block";             // show 2nd button
   }
   
   /* ------------ render list ---------- */
   function renderList() {
     ul.innerHTML = "";
     const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
   
     if (!items.length || items.every(i => i === "__")) {
       ul.textContent = "(nothing yet)";
       return;
     }
     items.forEach(i => {
       const li = document.createElement("li");
       li.textContent = i;
       ul.appendChild(li);
     });
   }
   renderList();
   
   /* ------------ clear / modal logic -- */
   resetBtn.addEventListener("click", () => {
     modal.style.display = "flex";
   });
   
   yesBtn.addEventListener("click", () => {
     localStorage.removeItem(STORAGE_KEY);
     localStorage.removeItem(MODE_KEY);
     renderList();
     modal.style.display = "none";
   
     /* revert UI if we just cleared imagination */
     if (imaginationMode) {
       h2.textContent       = "Inventory";
       resetBtn.textContent = "🗑️ clear inventory";
       modalTxt.textContent = "Clear your inventory?";
       guideBtn.style.display = "none";
     }
   });
   
   noBtn.addEventListener("click", () => {
     modal.style.display = "none";
   });
   
   /* ------------ sync across tabs ----- */
   window.addEventListener("storage", e => {
     if (e.key === STORAGE_KEY) renderList();
   });
   
  /* ------------ extra nav button ----- */
guideBtn.addEventListener("click", () => {
    /* if the pop‑up was opened by another window, use it */
    if (window.opener && !window.opener.closed) {
      window.opener.location.href = "4WayNav.html";   // load in main window
      window.close();                                 // close this pop‑up
    } else {
      /* fallback: just load in the current tab */
      window.location.href = "4WayNav.html";
    }
  });