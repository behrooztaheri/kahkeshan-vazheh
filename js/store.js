/* Progress is kept only in this browser (localStorage).
   The student's name is NEVER stored: it lives in memory for this visit only.
   The progress record is filed under a one-way code made from name + class,
   so typing the same name and class again finds the same progress. */
'use strict';
const Store = (() => {
  const PREFIX = 'kv1:';
  let mem = {};                 // fallback when localStorage is blocked
  let ok = true;
  try { localStorage.setItem('kv-test', '1'); localStorage.removeItem('kv-test'); } catch (e) { ok = false; }
  const get = (k) => { try { return ok ? localStorage.getItem(k) : mem[k] ?? null; } catch (e) { return mem[k] ?? null; } };
  const set = (k, v) => { try { if (ok) localStorage.setItem(k, v); else mem[k] = v; } catch (e) { mem[k] = v; } };
  const del = (k) => { try { if (ok) localStorage.removeItem(k); delete mem[k]; } catch (e) { delete mem[k]; } };

  // Make different spellings of the same name match: Arabic ی/ک, half-spaces, extra spaces, diacritics.
  const normName = (s) => String(s).normalize('NFC').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[ؤ]/g, 'و').replace(/[إأآ]/g, 'ا')
    .replace(/[ً-ٰٟ‌‍‎‏]/g, '').replace(/\s+/g, ' ').trim();
  const normClass = (s) => U.toLatin(String(s)).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  // cyrb53: fast one-way 53-bit hash. Run twice with different seeds for a longer code.
  function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) { ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  const code = (name, cls) => { const s = 'kahkeshan-vazheh|' + normName(name) + '|' + normClass(cls); return cyrb53(s, 7) + cyrb53(s, 1373); };

  let key = null, data = null, session = { name: '', cls: '' };
  const blank = () => ({ v: 1, courses: {}, last: null, drafts: {}, created: Date.now() });
  function login(name, cls) {
    session = { name: String(name).replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim(), cls: normClass(cls) };
    key = PREFIX + code(name, cls);
    const raw = get(key);
    let returning = false;
    try { data = raw ? JSON.parse(raw) : null; returning = !!data; } catch (e) { data = null; }
    if (!data) data = blank();
    save();
    return returning;
  }
  function logout() { key = null; data = null; session = { name: '', cls: '' }; }
  function save() { if (key && data) { data.updated = Date.now(); set(key, JSON.stringify(data)); } }
  function course(id) {
    if (!data.courses[id]) data.courses[id] = { done: {}, answered: {}, xp: 0, badges: [], pos: null };
    return data.courses[id];
  }
  function wipeMe() { if (key) del(key); logout(); }
  function resetCourse(id) { delete data.courses[id]; if (data.last && data.last.course === id) data.last = null; Object.keys(data.drafts).forEach((k) => k.startsWith(id + ':') && delete data.drafts[k]); save(); }
  function resetStation(id, sIdx) {
    const c = course(id); c.done[sIdx] = []; Object.keys(c.answered).forEach((k) => k.startsWith(sIdx + ':') && delete c.answered[k]);
    c.badges = c.badges.filter((b) => b !== sIdx); c.pos = { s: sIdx, i: 0 }; data.last = { course: id, s: sIdx, i: 0 }; save();
  }
  const pref = (k, v) => (v === undefined ? get('kv-pref:' + k) : set('kv-pref:' + k, v));
  return { login, logout, save, course, wipeMe, resetCourse, resetStation, pref, persistent: () => ok,
    get data() { return data; }, get name() { return session.name; }, get cls() { return session.cls; }, get logged() { return !!key; } };
})();
