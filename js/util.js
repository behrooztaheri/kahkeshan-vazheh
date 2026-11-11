/* Small helpers shared by every script. */
'use strict';
const U = (() => {
  const FA = '۰۱۲۳۴۵۶۷۸۹';
  const fa = (n) => String(n).replace(/\d/g, (d) => FA[d]);
  const toLatin = (s) => String(s).replace(/[۰-۹]/g, (d) => FA.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  // h('div.card#id', {onclick}, child, 'text', [children])
  function h(sel, props, ...kids) {
    const m = sel.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement(m[1] || 'div');
    (m[2].match(/[.#][\w-]+/g) || []).forEach((p) => (p[0] === '.' ? el.classList.add(p.slice(1)) : (el.id = p.slice(1))));
    if (props && (typeof props !== 'object' || props instanceof Node || Array.isArray(props))) { kids.unshift(props); props = null; }
    for (const k in props || {}) {
      const v = props[k];
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k in el && k !== 'list' && k !== 'type') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    const add = (c) => { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) c.forEach(add); else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c))); };
    kids.forEach(add);
    return el;
  }
  const img = (ref) => (/\.\w+$/.test(ref) ? `assets/img/${ref}` : `assets/img/${ref}.webp`);
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const shuffleNew = (a) => { if (a.length < 2) return a.slice(); let b; do b = shuffle(a); while (b.every((x, i) => x === a[i])); return b; };
  const toast = (msg, ms = 2400) => { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), ms); };
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  return { fa, toLatin, h, img, shuffle, shuffleNew, toast, reduced, sleep };
})();
