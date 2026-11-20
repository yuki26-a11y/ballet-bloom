/* Ballet Bloom · 基础工具与本地数据库 */
(function (global) {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function uid() {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function dateStr(d = new Date()) {
    const date = d instanceof Date ? d : new Date(d);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  function fmtDay(value) {
    if (!value) return '—';
    const d = new Date(value + (String(value).length === 10 ? 'T00:00:00' : ''));
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }
  function weekday(value) {
    const d = new Date(value + 'T00:00:00');
    return '周' + '日一二三四五六'[d.getDay()];
  }
  function fmtTime(ts) {
    const d = new Date(ts);
    return `${dateStr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function monthLabel(year, month) { return `${year} 年 ${month + 1} 月`; }

  const ICONS = {
    photo: '<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    hanger: '<path d="M12 6a2.5 2.5 0 1 1 2.5-2.5c0 .9-.5 1.6-1.2 2.1"/><path d="M12 8 3 17c-.8.8-.2 2 1 2h16c1.2 0 1.8-1.2 1-2z"/>',
    sparkle: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit: '<path d="m15 5 4 4M4 20l4-.8L19 8.2 15.8 5 4.8 16z"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    up: '<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    shuffle: '<path d="M3 7h3c5 0 7 10 12 10h3M18 14l3 3-3 3M3 17h3c2 0 3.5-1.7 4.8-4M14 8c1-1.8 2-3 4-3h3m-3-3 3 3-3 3"/>',
    save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    heart: '<path d="M20.8 8.5c0 4.3-8.8 10-8.8 10s-8.8-5.7-8.8-10A4.7 4.7 0 0 1 12 5.8a4.7 4.7 0 0 1 8.8 2.7Z"/>',
    dancer: '<circle cx="13" cy="4.5" r="2"/><path d="m13 7-3 6 4 3 1 5M10 13l-4 3-3 5M17 16l3 5M13 7l5 3 3-2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>',
    book: '<path d="M4 5c3-1.5 6-1.5 8 0 2-1.5 5-1.5 8 0v15c-3-1.5-6-1.5-8 0-2-1.5-5-1.5-8 0z"/><path d="M12 5v15"/>'
  };
  function icon(name, cls = '') {
    return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`;
  }

  /* ---------- IndexedDB ---------- */
  const DB_NAME = 'ballet-bloom';
  const DB_VERSION = 1;
  const STORES = ['photos', 'items', 'classes', 'looks'];
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!global.indexedDB) { reject(new Error('当前浏览器不支持本地存储')); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        STORES.forEach((name) => {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
        });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function run(store, mode, action) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const os = tx.objectStore(store);
      let result;
      const req = action(os);
      if (req) req.onsuccess = () => { result = req.result; };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('操作被取消'));
    });
  }

  const store = {
    all: (name) => run(name, 'readonly', (os) => os.getAll()),
    get: (name, id) => run(name, 'readonly', (os) => os.get(id)),
    put: (name, value) => run(name, 'readwrite', (os) => os.put(value)),
    remove: (name, id) => run(name, 'readwrite', (os) => os.delete(id))
  };

  /* ---------- 图片压缩 ---------- */
  function imageToDataUrl(file, max = 1400, quality = 0.85, keepAlpha = false) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!keepAlpha) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL(keepAlpha ? 'image/png' : 'image/jpeg', quality));
        } catch (err) { URL.revokeObjectURL(url); reject(err); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')); };
      img.src = url;
    });
  }

  function toast(message) {
    const root = $('#toast-root');
    if (!root) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.innerHTML = icon('check') + `<span>${esc(message)}</span>`;
    root.appendChild(node);
    setTimeout(() => { node.style.opacity = '0'; node.style.transform = 'translateX(20px)'; }, 2400);
    setTimeout(() => node.remove(), 2800);
  }

  global.BB = {
    $, $$, esc, uid, pad, dateStr, fmtDay, weekday, fmtTime, monthLabel,
    icon, store, imageToDataUrl, toast, ICONS
  };
})(window);
