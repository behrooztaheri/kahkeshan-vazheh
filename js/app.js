/* Screens, router, effects and certificate. */
'use strict';
const App = (() => {
  const { h, img, fa, toast, sleep } = U;
  const COURSES = { prompt: window.COURSE_PROMPT, writing: window.COURSE_WRITING };
  const app = document.getElementById('app');
  const LEVELS = ['تازه‌کار', 'کاوشگر', 'ماجراجو', 'استادکار', 'قهرمان', 'افسانه'];
  const levelOf = (xp) => Math.floor(xp / 100) + 1;
  const levelName = (lv) => LEVELS[Math.min(lv - 1, LEVELS.length - 1)];
  const go = (hash) => { if (location.hash === hash) route(); else location.hash = hash; };

  // ================================================================ effects
  const fx = document.getElementById('fx'), fctx = fx.getContext('2d');
  let parts = [], fxRun = false;
  function sizeFx() { const d = Math.min(devicePixelRatio || 1, 2); [fx, sky].forEach((c) => { c.width = innerWidth * d; c.height = innerHeight * d; }); fctx.setTransform(d, 0, 0, d, 0, 0); sctx.setTransform(d, 0, 0, d, 0, 0); makeStars(); }
  const PAL = ['#FFD166', '#F72585', '#7C4DFF', '#12B5A6', '#4CC9F0', '#FF9F1C', '#43C463'];
  function confetti(n = 140, x = innerWidth / 2, y = innerHeight / 3) {
    if (U.reduced()) return;
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: 4 + Math.random() * 5, c: PAL[i % PAL.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, life: 120 + Math.random() * 60, sq: Math.random() < 0.5 }); }
    if (!fxRun) { fxRun = true; requestAnimationFrame(tick); }
  }
  function burst(el, n = 18) { const r = el.getBoundingClientRect(); confettiSmall(r.left + r.width / 2, r.top + r.height / 2, n); }
  function confettiSmall(x, y, n) {
    if (U.reduced()) return;
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 4; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, r: 2.5 + Math.random() * 3, c: PAL[i % PAL.length], rot: 0, vr: 0.2, life: 45, sq: false }); }
    if (!fxRun) { fxRun = true; requestAnimationFrame(tick); }
  }
  function tick() {
    fctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life-- > 0 && p.y < innerHeight + 40);
    parts.forEach((p) => { p.vy += 0.25; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      fctx.save(); fctx.globalAlpha = Math.min(1, p.life / 30); fctx.fillStyle = p.c; fctx.translate(p.x, p.y); fctx.rotate(p.rot);
      if (p.sq) fctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { fctx.beginPath(); fctx.arc(0, 0, p.r / 1.4, 0, 7); fctx.fill(); } fctx.restore(); });
    if (parts.length) requestAnimationFrame(tick); else { fxRun = false; fctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  // floating XP number
  function floatXp(n, el) {
    const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0 };
    const f = h('div.xp-float', '+' + fa(n) + ' امتیاز');
    f.style.left = r.left + r.width / 2 + 'px'; f.style.top = r.top + 'px';
    document.body.appendChild(f); setTimeout(() => f.remove(), 1300);
  }

  // ================================================================ sky background
  const sky = document.getElementById('sky'), sctx = sky.getContext('2d');
  let stars = [], shoot = null, letters = [];
  const ABJAD = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی،؟«»'.split('');
  function makeStars() {
    const n = Math.round(innerWidth * innerHeight / 5200);
    stars = Array.from({ length: n }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.5 + 0.2, p: Math.random() * 6, s: 0.5 + Math.random() * 1.5 }));
    letters = Array.from({ length: Math.round(n / 7) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, ch: ABJAD[(Math.random() * ABJAD.length) | 0], sz: 14 + Math.random() * 30, v: 0.1 + Math.random() * 0.3, a: 0.04 + Math.random() * 0.08 }));
  }
  function drawSky(t) {
    sctx.clearRect(0, 0, innerWidth, innerHeight);
    const theme = document.body.dataset.course;
    if (theme === 'writing') {
      sctx.font = '700 20px Vazirmatn, sans-serif'; sctx.textAlign = 'center';
      letters.forEach((l) => { l.y -= l.v; if (l.y < -40) { l.y = innerHeight + 40; l.x = Math.random() * innerWidth; }
        sctx.globalAlpha = l.a; sctx.fillStyle = '#0B4F4A'; sctx.font = `800 ${l.sz}px Vazirmatn, sans-serif`; sctx.fillText(l.ch, l.x, l.y); });
    } else {
      stars.forEach((s) => { sctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t / 1000 * s.s + s.p)); sctx.fillStyle = '#fff'; sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, 7); sctx.fill(); });
      if (!shoot && Math.random() < 0.004) shoot = { x: Math.random() * innerWidth, y: Math.random() * innerHeight * 0.5, l: 0 };
      if (shoot) { shoot.l += 1; const len = 120, x = shoot.x - shoot.l * 9, y = shoot.y + shoot.l * 4;
        const g = sctx.createLinearGradient(x, y, x + len, y - len * 0.45); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        sctx.globalAlpha = Math.max(0, 1 - shoot.l / 50); sctx.strokeStyle = g; sctx.lineWidth = 2; sctx.beginPath(); sctx.moveTo(x, y); sctx.lineTo(x + len, y - len * 0.45); sctx.stroke(); if (shoot.l > 50) shoot = null; }
    }
    sctx.globalAlpha = 1;
    if (!U.reduced()) requestAnimationFrame(drawSky);
  }

  // ================================================================ shared pieces
  function topbar(course) {
    const c = course ? Store.course(course.id) : null;
    const total = Object.values(Store.data.courses).reduce((a, x) => a + (x.xp || 0), 0);
    const xp = c ? c.xp : total, lv = levelOf(xp);
    const snd = h('button.icon-btn', { title: 'صدا', 'aria-label': 'صدا روشن یا خاموش', onclick: () => { snd.textContent = Sfx.toggle() ? '🔊' : '🔈'; } }, Sfx.on ? '🔊' : '🔈');
    return h('header.topbar',
      h('button.brand', { onclick: () => go('#/courses'), title: 'صفحه انتخاب درس' }, h('span.logo', '✦'), h('span', 'کهکشان واژه')),
      h('div.top-mid', course ? h('button.crumb', { onclick: () => go('#/c/' + course.id) }, '🗺️ ', course.title) : null),
      h('div.top-end',
        h('div.xp-chip', { title: 'امتیاز و سطح' }, h('span.lv', fa(lv)), h('div.xp-bar', h('i', { style: { width: (xp % 100) + '%' } })), h('span.xp-n', fa(xp))),
        snd,
        h('button.icon-btn', { title: 'خانه', 'aria-label': 'خانه', onclick: () => go('#/courses') }, '🏠')));
  }
  function modal(content, cls = '') {
    const box = h('div.modal' + cls, content);
    const back = h('div.modal-back', { onclick: (e) => { if (e.target === back) close(); } }, box);
    function close() { back.classList.add('out'); setTimeout(() => back.remove(), 200); document.removeEventListener('keydown', esc); }
    const esc = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', esc);
    document.body.appendChild(back);
    return close;
  }
  function confirmBox(q, yes, okText = 'بله') {
    const close = modal([h('p.modal-q', q), h('div.row.center', h('button.btn.danger', { onclick: () => { close(); yes(); } }, okText), h('button.btn.ghost', { onclick: () => close() }, 'نه، بی‌خیال'))]);
  }
  function zoom(src, cap) { modal([h('img.zoom-img', { src, alt: cap || '' }), cap ? h('p.zoom-cap', cap) : null], '.zoom'); }
  const stationDone = (course, c, si) => (c.done[si] || []).length >= course.stations[si].steps.length;
  const stationPct = (course, c, si) => Math.round(100 * (c.done[si] || []).length / course.stations[si].steps.length);
  const coursePct = (course, c) => { const all = course.stations.reduce((a, s) => a + s.steps.length, 0); const d = course.stations.reduce((a, s, i) => a + (c.done[i] || []).length, 0); return Math.round(100 * d / all); };
  function ring(pct, size = 64, inner) {
    const r = size / 2 - 4, C = 2 * Math.PI * r;
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`); svg.setAttribute('class', 'ring'); svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.innerHTML = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
    return h('div.ring-wrap', svg, inner);
  }

  // ================================================================ screen: login
  function viewLogin() {
    document.body.dataset.course = 'home';
    const name = h('input#name', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: false, maxLength: 40, placeholder: 'مثلاً: سارا رضایی', 'aria-label': 'نام و نام خانوادگی به فارسی' });
    const cls = h('input#cls', { type: 'text', inputMode: 'numeric', autocomplete: 'off', maxLength: 4, placeholder: 'مثلاً: ۶۰۳', 'aria-label': 'شماره کلاس' });
    const err = h('p.err');
    const preview = h('div.hello-preview');
    name.addEventListener('input', () => { const v = name.value.trim(); preview.textContent = v ? `سلام ${v.split(' ')[0]}! 👋` : ''; err.textContent = ''; });
    cls.addEventListener('input', () => { cls.value = cls.value.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]).replace(/[^۰-۹٠-٩]/g, ''); err.textContent = ''; });
    function submit(e) {
      e.preventDefault();
      const n = name.value.replace(/\s+/g, ' ').trim(), c = U.toLatin(cls.value).replace(/\D/g, '');
      if (!/^[؀-ۿ‌ ]{2,40}$/.test(n) || /[0-9۰-۹٠-٩]/.test(n)) { err.textContent = 'نامت را با حروف فارسی بنویس (بدون عدد و حروف انگلیسی).'; name.focus(); Sfx.bad(); return; }
      if (n.replace(/[\s‌]/g, '').length < 2) { err.textContent = 'نام خیلی کوتاه است.'; Sfx.bad(); return; }
      if (!c || c.length > 4) { err.textContent = 'شماره کلاس را با عدد بنویس.'; cls.focus(); Sfx.bad(); return; }
      const back = Store.login(n, c);
      Sfx.level(); confetti(90);
      toast(back ? `خوش برگشتی ${n.split(' ')[0]}! پیشرفتت پیدا شد. 🚀` : `خوش آمدی ${n.split(' ')[0]}! سفر شروع شد. ✨`, 3200);
      go('#/courses');
    }
    app.replaceChildren(h('section.screen.login',
      h('div.hero',
        h('div.orbit', h('img.planet.p1', { src: img('pr/p_contest'), alt: '' }), h('img.planet.p2', { src: img('wr/p_paper'), alt: '' }), h('img.hero-bot', { src: img('pr/bot_wave'), alt: '' })),
        h('h1.title', h('span.glow', 'کهکشان واژه')),
        h('p.tagline', 'سفری بازی‌گونه برای یادگیری ', h('b', 'پرامت‌نویسی'), ' و ', h('b', 'نگارش فارسی'))),
      h('form.login-card', { onsubmit: submit, autocomplete: 'off' },
        h('h2', '🪪 کارت ورود فضانورد'),
        h('label', { htmlFor: 'name' }, 'نام و نام خانوادگی (فارسی)'), name,
        h('label', { htmlFor: 'cls' }, 'شماره کلاس'), cls,
        preview, err,
        h('button.btn.big.launch', { type: 'submit' }, '🚀 پرواز!'),
        h('details.privacy', h('summary', '🔒 نام من کجا ذخیره می‌شود؟'),
          h('p', 'هیچ‌جا! نام تو فقط تا وقتی این صفحه باز است در حافظه مرورگر می‌ماند و به هیچ سروری فرستاده نمی‌شود. پیشرفتت با یک ', h('b', 'رمز یک‌طرفه'), ' (ساخته‌شده از نام و کلاس) روی همین دستگاه نگه داشته می‌شود؛ از روی این رمز نمی‌شود نام را خواند.'),
          h('p', 'دفعه بعد همین نام و همین شماره کلاس را بنویس تا از همان جایی که بودی ادامه بدهی.'))),
      h('p.foot', 'ویژه دانش‌آموزان متوسطه اول و دوم · بدون تبلیغ · بدون ثبت‌نام')));
    setTimeout(() => name.focus(), 50);
  }

  // ================================================================ screen: course chooser
  function viewCourses() {
    document.body.dataset.course = 'home';
    const d = Store.data, first = Store.name.split(' ')[0];
    const last = d.last && COURSES[d.last.course] ? d.last : null;
    const cont = last ? (() => { const co = COURSES[last.course], st = co.stations[last.s];
      return h('button.continue-card', { onclick: () => go(`#/c/${co.id}/${last.s}/${last.i}`) },
        h('img', { src: img(st.img), alt: '' }), h('div', h('small', '⏯ ادامه از همان‌جا که بودی'), h('b', co.title + ' ← ' + st.title), h('span', `قدم ${fa(last.i + 1)} از ${fa(st.steps.length)}`)), h('span.arrow', '◀')); })() : null;
    const card = (co) => {
      const c = Store.course(co.id), pct = coursePct(co, c);
      return h('button.course-card.' + co.theme, { onclick: () => { Sfx.click(); go('#/c/' + co.id); } },
        h('div.cc-art', h('img.cc-planet', { src: img(co.planet), alt: '' }), h('img.cc-bot', { src: img(co.bot), alt: '' })),
        h('div.cc-body', h('h2', co.title), h('p', co.sub),
          h('div.cc-meta', h('span', '🪐 ', fa(co.stations.length), ' ایستگاه'), h('span', '🏅 ', fa(c.badges.length), ' از ', fa(co.stations.length), ' نشان'), h('span', '⭐ ', fa(c.xp), ' امتیاز')),
          h('div.bar', h('i', { style: { width: pct + '%' } })), h('div.cc-go', pct === 0 ? 'شروع سفر ←' : pct === 100 ? 'تمام شد! مرور یا گواهی‌نامه ←' : `${fa(pct)}٪ پیش رفته‌ای · ادامه ←`)));
    };
    app.replaceChildren(topbar(null), h('section.screen.courses',
      h('div.welcome', h('img.wave', { src: img('pr/bot_wave'), alt: '' }), h('div', h('h1', `سلام ${first}! 👋`), h('p', 'امروز کدام سفر را ادامه می‌دهی؟'))),
      cont,
      h('div.course-grid', card(COURSES.prompt), card(COURSES.writing)),
      h('div.account',
        h('span', '🔒 نامت جایی ذخیره نشده است', Store.persistent() ? '' : ' · ⚠️ این مرورگر اجازه ذخیره پیشرفت را نمی‌دهد؛ با بستن صفحه پیشرفت پاک می‌شود.'),
        h('div.row',
          h('button.btn.ghost.small', { onclick: () => { Store.logout(); go('#/'); } }, '🚪 خروج'),
          h('button.btn.ghost.small.danger-t', { onclick: () => confirmBox('همه پیشرفت تو روی این دستگاه پاک شود؟ این کار برگشت ندارد.', () => { Store.wipeMe(); toast('همه داده‌هایت پاک شد.'); go('#/'); }, 'بله، پاک کن') }, '🗑️ پاک کردن داده‌های من')))));
  }

  // ================================================================ screen: course map
  function viewMap(co) {
    document.body.dataset.course = co.theme;
    const c = Store.course(co.id);
    const next = co.stations.findIndex((s, i) => !stationDone(co, c, i));
    const allDone = next === -1;
    const nodes = co.stations.map((st, i) => {
      const pct = stationPct(co, c, i), done = stationDone(co, c, i), started = pct > 0;
      const resume = c.pos && c.pos.s === i && !done ? c.pos.i : (c.done[i] || []).length;
      return h('div.node' + (done ? '.done' : '') + (i === next ? '.next' : ''), { style: { '--c': st.color || '#7C4DFF', '--i': i } },
        h('button.node-btn', { onclick: () => { Sfx.click(); go(`#/c/${co.id}/${i}/${done ? 0 : Math.min(resume, st.steps.length - 1)}`); }, 'aria-label': st.title },
          ring(pct, 112, h('img.node-img', { src: img(st.img), alt: '' })), done ? h('img.node-badge', { src: img(st.badge), alt: 'نشان' }) : null, h('span.node-n', fa(i + 1))),
        h('div.node-info', h('h3', st.title), h('p', st.sub),
          h('div.row', h('button.btn.small', { onclick: () => go(`#/c/${co.id}/${i}/${done ? 0 : Math.min(resume, st.steps.length - 1)}`) }, done ? '🔁 مرور' : started ? '▶ ادامه' : '🚀 شروع'),
            started ? h('button.btn.ghost.small', { onclick: () => confirmBox(`ایستگاه «${st.title}» از اول شروع شود؟ پاسخ‌های این ایستگاه پاک می‌شود.`, () => { Store.resetStation(co.id, i); go(`#/c/${co.id}/${i}/0`); }) }, '↺ از اول') : null)));
    });
    app.replaceChildren(topbar(co), h('section.screen.map',
      h('div.map-head', h('img.map-planet', { src: img(co.planet), alt: '' }), h('div', h('h1', co.title), h('p', co.sub),
        h('div.bar.wide', h('i', { style: { width: coursePct(co, c) + '%' } })), h('small', `${fa(coursePct(co, c))}٪ از سفر · ${fa(c.badges.length)} نشان · ${fa(c.xp)} امتیاز · سطح ${fa(levelOf(c.xp))} (${levelName(levelOf(c.xp))})`))),
      h('div.badge-shelf', co.stations.map((st, i) => h('div.shelf-item' + (c.badges.includes(i) || stationDone(co, c, i) ? '.got' : ''), { title: st.badgeName }, h('img', { src: img(st.badge), alt: st.badgeName }), h('span', st.badgeName)))),
      allDone ? h('button.btn.big.gold', { onclick: () => go(`#/c/${co.id}/cert`) }, '🎓 گواهی‌نامه‌ام را بده!') : null,
      h('div.path', nodes),
      h('div.row.center.map-foot',
        h('button.btn.ghost.small', { onclick: () => go(`#/c/${co.id}/0/0`) }, '⏮ رفتن به اول درس'),
        h('button.btn.ghost.small.danger-t', { onclick: () => confirmBox(`همه پیشرفت «${co.title}» پاک شود و از صفر شروع کنی؟`, () => { Store.resetCourse(co.id); toast('درس از صفر شروع شد.'); go('#/c/' + co.id); }, 'بله، از صفر') }, '♻️ شروع دوباره کل درس'))));
    const nx = app.querySelector('.node.next'); if (nx && next > 0) setTimeout(() => nx.scrollIntoView({ block: 'center', behavior: U.reduced() ? 'auto' : 'smooth' }), 250);
  }

  // ================================================================ screen: lesson
  function viewLesson(co, si, i) {
    document.body.dataset.course = co.theme;
    const st = co.stations[si]; if (!st) return go('#/c/' + co.id);
    i = Math.max(0, Math.min(i, st.steps.length - 1));
    const c = Store.course(co.id), step = st.steps[i], key = si + ':' + i;
    c.pos = { s: si, i }; Store.data.last = { course: co.id, s: si, i }; Store.save();
    const seen = (c.done[si] || []).includes(i);
    const nextBtn = h('button.btn.next', { disabled: !seen, onclick: next }, i === st.steps.length - 1 ? 'پایان ایستگاه 🏁' : 'بعدی ←');
    const xpChip = () => app.querySelector('.xp-chip');
    function addXp(n, el) {
      const before = levelOf(c.xp); c.xp += n; Store.save(); floatXp(n, el);
      const chip = xpChip(); if (chip) { chip.querySelector('.xp-n').textContent = fa(c.xp); chip.querySelector('.lv').textContent = fa(levelOf(c.xp)); chip.querySelector('.xp-bar i').style.width = (c.xp % 100) + '%'; chip.classList.remove('pulse'); void chip.offsetWidth; chip.classList.add('pulse'); }
      if (levelOf(c.xp) > before) { Sfx.level(); confetti(80); toast(`⬆️ سطح ${fa(levelOf(c.xp))}: ${levelName(levelOf(c.xp))}!`, 3000); }
    }
    const ctx = {
      course: co, key, seen,
      ready() { if (!(c.done[si] || []).includes(i)) { (c.done[si] = c.done[si] || []).push(i); Store.save(); if (!c.answered[key + ':s']) { c.answered[key + ':s'] = 1; addXp(2, nextBtn); } } nextBtn.disabled = false; nextBtn.classList.add('glow'); },
      right(first, el) { Sfx.good(); if (el) burst(el); if (first && !c.answered[key]) { c.answered[key] = 1; addXp(10, el); } ctx.ready(); },
      wrong() { Sfx.bad(); if (!c.answered[key]) c.answered[key] = 0; },
      award(n) { if (!c.answered[key + ':a']) { c.answered[key + ':a'] = 1; addXp(n, nextBtn); } },
    };
    let body;
    try { body = Steps[step.t](step, ctx); } catch (e) { console.error(e); body = h('p', 'این بخش بارگذاری نشد.'); ctx.ready(); }
    function next() {
      Sfx.click();
      if (i < st.steps.length - 1) return go(`#/c/${co.id}/${si}/${i + 1}`);
      celebrate(co, si);
    }
    const pct = Math.round(100 * (i + 1) / st.steps.length);
    app.replaceChildren(topbar(co), h('section.screen.lesson', { style: { '--c': st.color } },
      h('div.lesson-head',
        h('button.icon-btn', { title: 'نقشه', onclick: () => go('#/c/' + co.id) }, '✕'),
        h('div.lesson-meta', h('div.lesson-title', h('img', { src: img(st.img), alt: '' }), h('span', `ایستگاه ${fa(si + 1)}: ${st.title}`)),
          h('div.steps-bar', st.steps.map((_, k) => h('i' + ((c.done[si] || []).includes(k) ? '.d' : '') + (k === i ? '.cur' : ''))))),
        h('span.step-n', `${fa(i + 1)}/${fa(st.steps.length)}`),
        h('button.icon-btn', { title: 'این ایستگاه از اول', onclick: () => confirmBox('این ایستگاه از اول شروع شود؟', () => { Store.resetStation(co.id, si); go(`#/c/${co.id}/${si}/0`); }) }, '↺')),
      h('article.step-card.t-' + step.t, { key }, body),
      h('nav.lesson-nav',
        h('button.btn.ghost', { disabled: i === 0 && si === 0, onclick: () => { Sfx.click(); if (i > 0) go(`#/c/${co.id}/${si}/${i - 1}`); else go(`#/c/${co.id}/${si - 1}/${co.stations[si - 1].steps.length - 1}`); } }, '→ قبلی'),
        h('span.pct', fa(pct) + '٪'),
        nextBtn)));
    window.scrollTo(0, 0);
    const card = app.querySelector('.step-card'); card.classList.add('enter');
  }

  // ================================================================ station complete
  function celebrate(co, si) {
    const c = Store.course(co.id), st = co.stations[si];
    const first = !c.badges.includes(si);
    if (first) { c.badges.push(si); c.xp += 50; Store.save(); }
    const nextSt = co.stations.findIndex((s, k) => k > si && !stationDone(co, c, k));
    const all = co.stations.every((s, k) => stationDone(co, c, k));
    if (all) Store.data.last = null; else if (nextSt >= 0) Store.data.last = { course: co.id, s: nextSt, i: Math.min((c.done[nextSt] || []).length, co.stations[nextSt].steps.length - 1) };
    Store.save();
    Sfx.level(); confetti(220); setTimeout(() => confetti(120, innerWidth * 0.2, innerHeight * 0.4), 450); setTimeout(() => confetti(120, innerWidth * 0.8, innerHeight * 0.4), 800);
    app.replaceChildren(topbar(co), h('section.screen.celebrate',
      h('div.rays'),
      h('img.big-badge', { src: img(st.badge), alt: st.badgeName }),
      h('h1', first ? 'نشان تازه گرفتی!' : 'دوباره عالی بودی!'),
      h('h2', `«${st.badgeName}»`),
      h('p', `ایستگاه ${fa(si + 1)}، «${st.title}»، تمام شد.`),
      first ? h('div.plus50', '+۵۰ امتیاز') : null,
      h('div.row.center',
        all ? h('button.btn.big.gold', { onclick: () => go(`#/c/${co.id}/cert`) }, '🎓 گواهی‌نامه!') : nextSt >= 0 ? h('button.btn.big', { onclick: () => go(`#/c/${co.id}/${nextSt}/${Math.min((c.done[nextSt] || []).length, co.stations[nextSt].steps.length - 1)}`) }, `ایستگاه بعد: ${co.stations[nextSt].title} ←`) : null,
        h('button.btn.ghost', { onclick: () => go('#/c/' + co.id) }, '🗺️ نقشه'))));
  }

  // ================================================================ certificate (drawn with the in-memory name; nothing stored)
  function viewCert(co) {
    document.body.dataset.course = co.theme;
    const c = Store.course(co.id);
    if (!co.stations.every((s, k) => stationDone(co, c, k))) { toast('برای گواهی‌نامه باید همه ایستگاه‌ها را تمام کنی.'); return go('#/c/' + co.id); }
    const cv = h('canvas.cert', { width: 1600, height: 1130 });
    const pics = [co.bot, ...co.stations.map((s) => s.badge)].map((r) => { const im = new Image(); im.src = img(r); return im; });
    Promise.all(pics.map((im) => (im.complete ? 1 : new Promise((r) => { im.onload = im.onerror = r; })))).then(() => document.fonts && document.fonts.ready).then(() => drawCert(cv, co, c, pics));
    const dl = h('button.btn.big.gold', { onclick: () => { const a = h('a', { href: cv.toDataURL('image/png'), download: `${co.certTitle}.png` }); document.body.appendChild(a); a.click(); a.remove(); Sfx.good(); } }, '⬇️ دانلود گواهی‌نامه');
    confetti(200);
    app.replaceChildren(topbar(co), h('section.screen.cert-screen', h('h1', '🎓 تبریک!'), h('p', 'گواهی‌نامه‌ات آماده است. نامت فقط روی همین تصویر نوشته می‌شود و هیچ‌جا ذخیره نمی‌شود.'), h('div.cert-wrap', cv),
      h('div.row.center', dl, h('button.btn.ghost', { onclick: () => window.print() }, '🖨️ چاپ'), h('button.btn.ghost', { onclick: () => go('#/c/' + co.id) }, '🗺️ نقشه'))));
  }
  function drawCert(cv, co, c, pics) {
    const x = cv.getContext('2d'), W = cv.width, H = cv.height, dark = co.theme === 'prompt';
    const g = x.createLinearGradient(0, 0, W, H);
    if (dark) { g.addColorStop(0, '#1B0F5C'); g.addColorStop(1, '#3A0F63'); } else { g.addColorStop(0, '#FFFBF0'); g.addColorStop(1, '#E3F6F2'); }
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    if (dark) for (let k = 0; k < 220; k++) { x.globalAlpha = Math.random() * 0.8; x.fillStyle = '#fff'; x.beginPath(); x.arc(Math.random() * W, Math.random() * H, Math.random() * 2, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    const gold = '#F2B632';
    x.strokeStyle = gold; x.lineWidth = 10; x.strokeRect(40, 40, W - 80, H - 80); x.lineWidth = 2; x.strokeRect(62, 62, W - 124, H - 124);
    x.textAlign = 'center'; x.direction = 'rtl';
    const ink = dark ? '#FFFFFF' : '#0B3B38', soft = dark ? '#CFC6FF' : '#2D6A64';
    x.drawImage(pics[0], W / 2 - 90, 90, 180, 180);
    x.fillStyle = gold; x.font = '900 70px Vazirmatn, Tahoma, sans-serif'; x.fillText(co.certTitle, W / 2, 345);
    x.fillStyle = soft; x.font = '500 36px Vazirmatn, Tahoma, sans-serif'; x.fillText('این گواهی با افتخار تقدیم می‌شود به', W / 2, 425);
    x.fillStyle = ink; x.font = '900 92px Vazirmatn, Tahoma, sans-serif'; x.fillText(Store.name, W / 2, 545);
    x.strokeStyle = gold; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2 - 360, 575); x.lineTo(W / 2 + 360, 575); x.stroke();
    x.fillStyle = soft; x.font = '500 36px Vazirmatn, Tahoma, sans-serif';
    x.fillText(`کلاس ${fa(Store.cls)} · برای پایان موفق هر ${fa(co.stations.length)} ایستگاه «${co.title}» با ${fa(c.xp)} امتیاز`, W / 2, 640);
    const n = co.stations.length, sz = 110, gap = 40, tw = n * sz + (n - 1) * gap, sx = (W - tw) / 2;
    co.stations.forEach((s, k) => { const bx = W - sx - (k + 1) * sz - k * gap; x.drawImage(pics[k + 1], bx, 690, sz, sz); x.fillStyle = soft; x.font = '600 22px Vazirmatn, Tahoma, sans-serif'; x.fillText(s.badgeName, bx + sz / 2, 830); });
    const date = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date());
    x.fillStyle = ink; x.font = '600 32px Vazirmatn, Tahoma, sans-serif';
    x.fillText(date, W * 0.25, 960); x.fillText('کهکشان واژه', W * 0.75, 960);
    x.fillStyle = soft; x.font = '400 24px Vazirmatn, Tahoma, sans-serif'; x.fillText('تاریخ', W * 0.25, 1005); x.fillText(`راهنما: ${co.botName}`, W * 0.75, 1005);
  }

  // ================================================================ router
  function route() {
    const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!Store.logged) { if (p.length) { /* keep nothing: ask for the name first */ } return viewLogin(); }
    if (!p.length) return go('#/courses');
    if (p[0] === 'courses') return viewCourses();
    if (p[0] === 'c' && COURSES[p[1]]) {
      const co = COURSES[p[1]];
      if (!p[2]) return viewMap(co);
      if (p[2] === 'cert') return viewCert(co);
      return viewLesson(co, +p[2] || 0, +p[3] || 0);
    }
    go('#/courses');
  }
  addEventListener('hashchange', route);
  addEventListener('resize', () => { clearTimeout(sizeFx._t); sizeFx._t = setTimeout(sizeFx, 150); });
  addEventListener('keydown', (e) => {
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName) || document.querySelector('.modal-back')) return;
    const nb = document.querySelector('.lesson-nav .btn.next');
    if (e.key === 'ArrowLeft' && nb && !nb.disabled) nb.click();
    if (e.key === 'ArrowRight') { const pb = document.querySelector('.lesson-nav .btn.ghost'); if (pb && !pb.disabled) pb.click(); }
  });
  // Name is in memory only: closing the tab forgets it. Warn nothing, but drop it from bfcache restores.
  addEventListener('pageshow', (e) => { if (e.persisted && !Store.logged) route(); });

  sizeFx(); requestAnimationFrame(drawSky);
  if (location.hash && location.hash !== '#/') history.replaceState(null, '', '#/');
  route();
  return { zoom, burst, confetti };
})();
