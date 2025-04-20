/* -----------------------------------------------------------
   dante_javascript.js
   -----------------------------------------------------------
   Persistent inventory  +  auto‑opening pop‑up  +  helpers
   ----------------------------------------------------------- */

/* ---------- storage helpers ---------- */
const STORAGE_KEY = "pickedUpItems";

function loadInventory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveInventory(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/* global live array */
let pickedUpItems = loadInventory();

/* ---------- array utilities ---------- */
function ensureLength(n) {
  while (pickedUpItems.length < n) pickedUpItems.push("__");
}
function realCount() {
  return pickedUpItems.filter(v => v !== "__").length;
}

/* ---------- pop‑up window ---------- */
function openInventory() {
  const w = 300,
        h = screen.height,
        left = screen.width - w;
  window.open(
    "inventory.html",          // URL
    "inventoryWindow",         // name (re‑uses same pop‑up)
    `width=${w},height=${h},left=${left},top=0,` +
    "scrollbars=yes,resizable=no,toolbar=no"
  );
}
function maybeOpenPopup() {
  if (realCount() === 1) openInventory();   // only first real item
}

/* ---------- public API ---------- */

/* 1) place/overwrite ONLY if slot is empty ("__")               */
function addItemAt(index, value) {
  ensureLength(index + 1);

  if (pickedUpItems[index] === "__" || pickedUpItems[index] === undefined) {
    pickedUpItems[index] = value;
    saveInventory(pickedUpItems);
    maybeOpenPopup();
  }
}

/* 2) handy helper: put value in the first free (“__”) slot      */
function addItemNext(value) {
  let idx = pickedUpItems.indexOf("__");
  if (idx === -1) {              // none free → push to the end
    idx = pickedUpItems.length;
    pickedUpItems.push("__");    // create that position
  }
  addItemAt(idx, value);         // will write & save
}

/* 3) generic push (used on pages that don’t care about order)   */
function pickUpItem(el) {
  const item = el.dataset.item || el.id || el.textContent.trim();

  if (!pickedUpItems.includes(item)) {
    pickedUpItems.push(item);
    saveInventory(pickedUpItems);
    maybeOpenPopup();
  }
}

/* 4) optional checker                                           */
function checkItems(itemNeeded) {
  return pickedUpItems.includes(itemNeeded);
}