/* Lesson step renderers. Each takes (step, ctx) and returns an element.
   ctx.ready() unlocks «بعدی»; ctx.right()/ctx.wrong() give feedback and XP; ctx.seen is true on a revisit. */
'use strict';
const Steps = (() => {
  const { h, img, fa, shuffle, shuffleNew, sleep } = U;
  const title = (s) => (s.title ? h('h2.step-title', s.title) : null);
  const intro = (t) => (t ? h('p.step-intro', t) : null);
  const note = (t) => (t ? h('p.step-note', '💡 ', t) : null);
  const lines = (t) => String(t).split('\n').map((l, i, a) => [l, i < a.length - 1 ? h('br') : null]);
  const botImg = (ref, cls = '') => h('img.bot' + cls, { src: img(ref), alt: '', draggable: false });
  const feedback = (ok, text) => h('div.fb' + (ok ? '.ok' : '.no'), h('b', ok ? 'آفرین! ' : 'نه هنوز... '), text || '');
  const shake = (el) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

  // ------------------------------------------------------------- passive steps
  function talk(s, ctx) {
    const bubble = h('div.bubble.big');
    const el = h('div.talk', botImg(s.bot, '.bounce'), bubble);
    if (ctx.seen) { bubble.append(...lines(s.say).flat().filter(Boolean)); ctx.ready(); } else typeInto(bubble, s.say, 18).then(ctx.ready);
    return el;
  }
  function cards(s, ctx) {
    const grid = h('div.cards' + (s.items.length === 2 ? '.two' : s.items.length === 5 ? '.five' : ''),
      s.items.map(([e, hh, b], i) => h('div.card.pop', { style: { animationDelay: i * 80 + 'ms' } }, h('div.emoji', e), h('h3', hh), b ? h('p', b) : null)));
    const letter = s.letter ? h('div.letter-sheet', s.letter.map((l, i) => h('p', { className: i === 0 && l.includes('خدا') ? 'center' : l.startsWith('موضوع') ? 'bold' : '' }, l))) : null;
    ctx.ready();
    return h('div', title(s), s.bot ? h('div.talk.small', botImg(s.bot), h('div.bubble', s.intro)) : intro(s.intro), letter, s.items.length ? grid : null, note(s.note));
  }
  function compare(s, ctx) {
    const pane = ([lab, txt, pic], good) => h('div.pane' + (good ? '.good' : s.info ? '.info' : '.bad'),
      h('div.pane-label', good ? '✔ ' : s.info ? '✎ ' : '✘ ', lab), pic ? h('img.pane-img', { src: img(pic), alt: lab }) : null, txt ? h('p' + (s.ltr ? '.ltr' : ''), txt) : null);
    ctx.ready();
    return h('div', title(s), h('div.compare', pane(s.bad, false), pane(s.good, true)), s.tip ? h('div.tip', botImg(s.bot || (ctx.course.id === 'prompt' ? 'pr/bot_wink' : 'wr/bot_wink')), h('p', s.tip)) : null);
  }
  function gallery(s, ctx) {
    ctx.ready();
    return h('div', title(s), intro(s.intro), h('div.gallery' + (s.items.length === 3 ? '.three' : ''), s.items.map(([ref, cap], i) =>
      h('figure.pop', { style: { animationDelay: i * 90 + 'ms' }, onclick: () => App.zoom(img(ref), cap) }, h('img', { src: img(ref), alt: cap, loading: 'lazy' }), h('figcaption', cap)))), note(s.note));
  }
  function lab(s, ctx) {
    ctx.ready();
    return h('div', title(s), note(s.note), h('div.lab', h('iframe', { src: s.src, title: s.title, loading: 'lazy', style: { height: s.h + 'px' } })),
      h('a.btn.ghost.small', { href: s.src, target: '_blank', rel: 'noopener' }, 'باز کردن در صفحه جدا ↗'));
  }
  function code(s, ctx) {
    const out = h('div.code-note', 'روی یک خط بزن.');
    const pre = h('div.code', s.lines.map(([c, n], i) => h('button.code-line', { onclick: (e) => { pre.querySelectorAll('.on').forEach((x) => x.classList.remove('on')); e.currentTarget.classList.add('on'); out.textContent = n; Sfx.pop(); } },
      h('span.ln', i + 1), h('code', c))));
    ctx.ready();
    return h('div', title(s), intro(s.intro), h('div.code-wrap', pre, out));
  }

  // ------------------------------------------------------------- demo: prompt → real output
  async function typeInto(el, text, speed = 12) {
    el.textContent = '';
    if (U.reduced()) { el.append(...lines(text).flat().filter(Boolean)); return; }
    let skip = false; el.onclick = () => (skip = true);
    for (let i = 0; i < text.length; i++) {
      if (skip) { el.textContent = ''; el.append(...lines(text).flat().filter(Boolean)); break; }
      const ch = text[i];
      if (ch === '\n') el.appendChild(h('br')); else el.appendChild(document.createTextNode(ch));
      if (i % 3 === 0) Sfx.type();
      await sleep(ch === ' ' ? speed / 2 : speed);
    }
    el.onclick = null;
  }
  function demo(s, ctx) {
    const rounds = s.rounds || [[s.prompt, s.out]];
    const wrap = h('div.chat');
    const btn = h('button.btn.run', '▶ اجرا کن');
    let r = 0;
    const user = (p) => h('div.msg.user' + (s.ltr ? '.ltr' : ''), h('span.who', 'پرامت ما'), h('div', lines(p)));
    wrap.appendChild(user(rounds[0][0]));
    async function run() {
      btn.disabled = true; Sfx.click();
      const [, out] = rounds[r];
      const think = h('div.msg.ai.thinking', h('span.who', ctx.course.id === 'prompt' || !s.media ? 'خروجی واقعی' : 'خروجی'), h('div.dots', h('i'), h('i'), h('i')));
      wrap.appendChild(think); think.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      await sleep(U.reduced() ? 100 : 900);
      think.classList.remove('thinking'); think.lastChild.remove();
      const body = h('div' + (s.ltr ? '.ltr' : '') + (s.mono ? '.mono' : ''));
      think.appendChild(body);
      if (out) await typeInto(body, out, 10);
      if (r === rounds.length - 1) {
        if (s.video) think.appendChild(h('video', { src: s.video, controls: true, playsInline: true, preload: 'metadata', poster: '' }));
        if (s.audio) think.appendChild(h('audio', { src: s.audio, controls: true, preload: 'metadata' }));
        if (s.note) wrap.appendChild(note(s.note));
        btn.remove(); ctx.ready(); ctx.award(3);
      } else {
        r++; wrap.appendChild(user(rounds[r][0])); btn.disabled = false; btn.textContent = '▶ دور بعد';
      }
    }
    btn.onclick = run;
    if (ctx.seen) { // revisit: show everything instantly
      wrap.innerHTML = '';
      rounds.forEach(([p, o], i) => { wrap.appendChild(user(p)); const m = h('div.msg.ai', h('span.who', 'خروجی واقعی'), o ? h('div' + (s.ltr ? '.ltr' : '') + (s.mono ? '.mono' : ''), lines(o)) : null);
        if (i === rounds.length - 1) { if (s.video) m.appendChild(h('video', { src: s.video, controls: true, playsInline: true, preload: 'metadata' })); if (s.audio) m.appendChild(h('audio', { src: s.audio, controls: true, preload: 'metadata' })); }
        wrap.appendChild(m); });
      if (s.note) wrap.appendChild(note(s.note));
      ctx.ready();
      return h('div', title(s), wrap);
    }
    return h('div', title(s), wrap, btn);
  }

  // ------------------------------------------------------------- quiz
  function quiz(s, ctx) {
    let tries = 0;
    const fb = h('div.fb-slot');
    const opts = h('div.opts', s.o.map((o, i) => h('button.opt' + (s.ltr ? '.ltr' : ''), { onclick: (e) => pick(i, e.currentTarget) }, h('span.opt-k', ['الف', 'ب', 'پ', 'ت'][i]), h('span', o))));
    function pick(i, b) {
      if (opts.classList.contains('done')) return;
      tries++;
      if (i === s.a) { b.classList.add('right'); opts.classList.add('done'); fb.replaceChildren(feedback(true, s.why)); ctx.right(tries === 1, b); }
      else { b.classList.add('wrong'); b.disabled = true; shake(b); fb.replaceChildren(feedback(false, 'دوباره فکر کن!')); ctx.wrong(); }
    }
    if (ctx.seen) { opts.classList.add('done'); opts.children[s.a].classList.add('right'); fb.appendChild(feedback(true, s.why)); ctx.ready(); }
    return h('div', title(s), s.img ? h('img.quiz-img', { src: img(s.img), alt: '', onclick: () => App.zoom(img(s.img), '') }) : null,
      s.code ? h('pre.code-block', s.code) : null, h('p.q', s.q), opts, fb);
  }
  // ------------------------------------------------------------- true / false
  function tf(s, ctx) {
    let left = s.items.length;
    const rows = s.items.map(([t, ans, why]) => {
      const fb = h('div.tf-why');
      let tries = 0;
      const row = h('div.tf-row', h('p', t), h('div.tf-btns',
        h('button.tf.yes', { onclick: (e) => go(true, e.currentTarget) }, '✔ درست'), h('button.tf.no', { onclick: (e) => go(false, e.currentTarget) }, '✘ نادرست')), fb);
      function go(v, b) {
        if (row.classList.contains('done')) return; tries++;
        if (v === ans) { row.classList.add('done'); b.classList.add('right'); fb.textContent = why || (ans ? 'درست است.' : 'نادرست است.'); ctx.right(tries === 1, b); if (--left === 0) ctx.ready(); }
        else { b.classList.add('wrong'); shake(row); ctx.wrong(); }
      }
      if (ctx.seen) { row.classList.add('done'); row.querySelector(ans ? '.yes' : '.no').classList.add('right'); fb.textContent = why || ''; }
      return row;
    });
    if (ctx.seen) ctx.ready();
    return h('div', title(s), intro(s.intro), h('div.tf-list', rows));
  }
  // ------------------------------------------------------------- order (tap to arrange)
  function order(s, ctx) {
    const tray = h('div.tray' + (s.train ? '.train' : ''));
    const pool = h('div.pool');
    const fb = h('div.fb-slot');
    let tries = 0;
    const chip = (t) => h('button.chip' + (s.train ? '.wagon' : ''), { onclick: (e) => move(e.currentTarget) }, t);
    shuffleNew(s.items).forEach((t) => pool.appendChild(chip(t)));
    const check = h('button.btn.check', { disabled: true, onclick: verify }, 'بررسی کن');
    function move(c) {
      if (tray.classList.contains('done')) return; Sfx.pop();
      (c.parentNode === pool ? tray : pool).appendChild(c);
      c.classList.remove('bad');
      check.disabled = pool.children.length > 0;
      tray.classList.toggle('empty', !tray.children.length);
    }
    function verify() {
      tries++;
      const got = [...tray.children].map((c) => c.textContent);
      let all = true;
      [...tray.children].forEach((c, i) => { const ok = got[i] === s.items[i]; c.classList.toggle('good', ok); c.classList.toggle('bad', !ok); if (!ok) all = false; });
      if (all) { tray.classList.add('done'); check.remove(); fb.replaceChildren(feedback(true, s.note || 'ترتیب کاملاً درست است.')); ctx.right(tries === 1, tray); }
      else { shake(tray); fb.replaceChildren(feedback(false, 'قرمزها جایشان درست نیست. رویشان بزن تا برگردند.')); ctx.wrong(); }
    }
    tray.classList.add('empty');
    if (ctx.seen) { pool.innerHTML = ''; tray.innerHTML = ''; s.items.forEach((t) => { const c = chip(t); c.classList.add('good'); tray.appendChild(c); }); tray.classList.add('done'); tray.classList.remove('empty'); ctx.ready(); return h('div', title(s), intro(s.intro), tray); }
    return h('div', title(s), intro(s.intro), h('p.hint', 'به ترتیب روی کارت‌ها بزن تا در ردیف بالا بنشینند.'), tray, pool, check, fb);
  }
  // ------------------------------------------------------------- match pairs
  function match(s, ctx) {
    let sel = null, left = s.pairs.length, tries = 0, mistakes = 0;
    const colors = ['#7C4DFF', '#F72585', '#12B5A6', '#FF9F1C', '#2E7BD6', '#43C463'];
    const L = h('div.mcol', s.pairs.map(([a], i) => h('button.mitem', { 'data-i': i, onclick: (e) => choose(e.currentTarget) }, a)));
    const R = h('div.mcol' + (s.ltr ? '.ltr' : ''), shuffle(s.pairs.map(([, b], i) => [b, i])).map(([b, i]) => h('button.mitem', { 'data-i': i, onclick: (e) => target(e.currentTarget) }, b)));
    function choose(b) { if (b.classList.contains('locked')) return; L.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); sel = b; Sfx.pop(); }
    function target(b) {
      if (!sel || b.classList.contains('locked')) { if (!sel) U.toast('اول از ستون راست یکی را انتخاب کن.'); return; }
      tries++;
      if (b.dataset.i === sel.dataset.i) {
        const c = colors[(s.pairs.length - left) % colors.length];
        [sel, b].forEach((x) => { x.classList.add('locked'); x.classList.remove('sel'); x.style.setProperty('--c', c); });
        sel = null; Sfx.good(); left--;
        if (!left) { ctx.right(mistakes === 0, R); ctx.ready(); }
      } else { mistakes++; shake(b); ctx.wrong(); }
    }
    if (ctx.seen) { L.querySelectorAll('.mitem').forEach((x) => x.classList.add('locked')); R.querySelectorAll('.mitem').forEach((x) => x.classList.add('locked')); ctx.ready(); }
    return h('div', title(s), intro(s.intro), h('p.hint', 'یکی از راست انتخاب کن، بعد جفتش را در چپ بزن.'), h('div.match', L, R));
  }
  // ------------------------------------------------------------- sort into buckets
  function sort(s, ctx) {
    let cur = null, left = s.items.length, mistakes = 0;
    const pool = h('div.pool', shuffle(s.items).map(([t, b]) => h('button.chip', { 'data-b': b, onclick: (e) => { pool.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel')); cur = e.currentTarget; cur.classList.add('sel'); Sfx.pop(); } }, t)));
    const buckets = h('div.buckets' + (s.buckets.length === 3 ? '.three' : ''), s.buckets.map((name, i) => h('div.bucket', { onclick: () => drop(i) }, h('div.bucket-name', name), h('div.bucket-items'))));
    function drop(i) {
      if (!cur) { U.toast('اول یک کارت را انتخاب کن.'); return; }
      const box = buckets.children[i];
      if (+cur.dataset.b === i) { cur.classList.remove('sel'); cur.classList.add('placed'); box.lastChild.appendChild(cur); cur.onclick = null; cur = null; Sfx.good(); App.burst(box); if (--left === 0) { ctx.right(mistakes === 0, buckets); ctx.ready(); } }
      else { mistakes++; shake(box); ctx.wrong(); }
    }
    if (ctx.seen) { [...pool.children].forEach((c) => { c.classList.add('placed'); buckets.children[+c.dataset.b].lastChild.appendChild(c); }); ctx.ready(); }
    return h('div', title(s), intro(s.intro), h('p.hint', 'روی کارت بزن، بعد روی سبد درست.'), pool, buckets, note(s.note));
  }
  // ------------------------------------------------------------- spot the mistakes
  function spot(s, ctx) {
    const toks = s.text.split(' ').map((t) => ({ bad: t.startsWith('~'), t: t.replace(/^~/, '').replace(/_/g, ' ') }));
    let left = toks.filter((x) => x.bad).length, mistakes = 0;
    const fb = h('div.fb-slot');
    const counter = h('span.counter', fa(left));
    const box = h('div.spot', toks.map((x) => h('button.word', { onclick: (e) => hit(x, e.currentTarget) }, x.t)));
    function hit(x, b) {
      if (b.classList.contains('found') || box.classList.contains('done')) return;
      if (x.bad) { b.classList.add('found'); Sfx.good(); App.burst(b); counter.textContent = fa(--left); if (!left) finish(); }
      else { mistakes++; b.classList.add('miss'); shake(b); ctx.wrong(); setTimeout(() => b.classList.remove('miss'), 600); if (mistakes >= 3) reveal.hidden = false; }
    }
    const reveal = h('button.btn.ghost.small', { hidden: true, onclick: () => { [...box.children].forEach((b, i) => toks[i].bad && b.classList.add('found')); left = 0; finish(true); } }, 'نشانم بده');
    function finish(shown) { box.classList.add('done'); reveal.remove(); fb.replaceChildren(h('div.fixed', h('b', 'شکل درست: '), s.fixed), feedback(true, s.why)); ctx.right(!shown && mistakes === 0, box); ctx.ready(); }
    if (ctx.seen) { [...box.children].forEach((b, i) => toks[i].bad && b.classList.add('found')); box.classList.add('done'); fb.append(h('div.fixed', h('b', 'شکل درست: '), s.fixed)); ctx.ready(); }
    return h('div', title(s), intro(s.intro), h('p.hint', 'غلط‌های باقی‌مانده: ', counter), box, reveal, fb);
  }
  // ------------------------------------------------------------- blanks
  function blanks(s, ctx) {
    const picks = [];
    const fb = h('div.fb-slot');
    let tries = 0;
    const sentence = h('div.blanks', s.parts.map((p) => {
      if (typeof p === 'string') return h('span', p);
      const k = picks.length; picks.push(null);
      const g = h('span.blank', p[0].map((o, j) => h('button.bopt', { onclick: () => { picks[k] = j; [...g.children].forEach((c, jj) => { c.classList.toggle('on', jj === j); c.classList.remove('bad', 'good'); }); Sfx.pop(); check.disabled = picks.includes(null); } }, o)));
      g.dataset.a = p[1];
      return g;
    }));
    const check = h('button.btn.check', { disabled: true, onclick: () => {
      tries++; let all = true;
      sentence.querySelectorAll('.blank').forEach((g, k) => { const ok = picks[k] === +g.dataset.a; g.children[picks[k]].classList.add(ok ? 'good' : 'bad'); if (!ok) all = false; });
      if (all) { sentence.classList.add('done'); check.remove(); fb.replaceChildren(feedback(true, 'همه جاهای خالی درست است.')); ctx.right(tries === 1, sentence); }
      else { shake(sentence); fb.replaceChildren(feedback(false, 'گزینه‌های قرمز را عوض کن.')); ctx.wrong(); }
    } }, 'بررسی کن');
    if (ctx.seen) { sentence.querySelectorAll('.blank').forEach((g) => g.children[+g.dataset.a].classList.add('good')); sentence.classList.add('done'); ctx.ready(); return h('div', title(s), intro(s.intro), sentence); }
    return h('div', title(s), intro(s.intro), sentence, check, fb);
  }
  // ------------------------------------------------------------- builder
  function builder(s, ctx) {
    const picks = s.slots.map(() => null);
    const preview = h('div.preview' + (s.ltr ? '.ltr' : ''), h('span.ph', 'پرامت تو اینجا ساخته می‌شود...'));
    const fb = h('div.fb-slot');
    let tries = 0;
    const rows = s.slots.map(([k, opts, a], i) => h('div.slot', h('div.slot-k', k), h('div.slot-opts', opts.map((o, j) => h('button.sopt' + (s.ltr ? '.ltr' : ''), { onclick: (e) => {
      picks[i] = j; [...e.currentTarget.parentNode.children].forEach((c, jj) => c.classList.toggle('on', jj === j)); e.currentTarget.parentNode.querySelectorAll('.bad').forEach((x) => x.classList.remove('bad')); Sfx.pop(); render(); } }, o)))));
    function render() {
      preview.innerHTML = '';
      picks.forEach((p, i) => { if (p !== null) preview.appendChild(h('span.piece', { style: { '--d': i } }, s.slots[i][1][p] + ' ')); });
      if (!preview.children.length) preview.appendChild(h('span.ph', 'پرامت تو اینجا ساخته می‌شود...'));
      check.disabled = picks.includes(null);
    }
    const check = h('button.btn.check', { disabled: true, onclick: () => {
      tries++; const bad = picks.map((p, i) => p !== s.slots[i][2]);
      rows.forEach((r, i) => r.querySelectorAll('.sopt')[picks[i]].classList.toggle('bad', bad[i]));
      if (!bad.includes(true)) { check.remove(); fb.replaceChildren(feedback(true, 'پرامت قهرمان ساختی! همه کلیدها سر جایشان هستند.')); preview.classList.add('done'); ctx.right(tries === 1, preview); }
      else { fb.replaceChildren(feedback(false, 'گزینه‌های قرمز را بهتر کن.')); ctx.wrong(); }
    } }, 'بررسی کن');
    if (ctx.seen) { s.slots.forEach(([, , a], i) => { picks[i] = a; rows[i].querySelectorAll('.sopt')[a].classList.add('on'); }); render(); check.remove(); preview.classList.add('done'); ctx.ready(); }
    return h('div', title(s), intro(s.intro), h('div.builder', rows), h('div.preview-wrap', h('div.preview-label', 'پرامت سوارشده'), preview), check, fb);
  }
  // ------------------------------------------------------------- prompt lab: live five-key analyser
  const KEYS = [
    ['نقش', '🎭', /تو (یک |یه )?[^.،؟!]{1,40}? هستی|نقش|به عنوان/, 'بگو هوش مصنوعی چه کسی باشد: «تو یک ... هستی.»'],
    ['کار', '🎯', /(بنویس|توضیح بده|بساز|بگو|خلاصه کن|مقایسه کن|پیشنهاد (بده|کن)|حل کن|ترجمه کن|طراحی کن|بکش|فهرست کن|کمک کن|بپرس)/, 'با یک فعل روشن بگو چه کاری بکند: بنویس، توضیح بده...'],
    ['زمینه', '🗺️', /([0-9۰-۹]+ ?سال|ساله|مخاطب|کلاس|ارائه|برای (بچه|دانش|کودک|کلاس|معلم|مسابقه|پروژه)|من .{1,30}(هستم|دارم|می‌خواهم))/, 'بگو برای چه کسی و چرا: «من ۱۱ ساله‌ام و...»'],
    ['قالب', '📐', /(جدول|فهرست|جمله|خط|بند|شعر|مرحله|قدم|سؤال|سوال|کلمه|شماره|داستان|نامه|پاراگراف)/, 'بگو پاسخ چه شکلی باشد: «در پنج جمله کوتاه»'],
    ['مرز', '🚧', /(نکن|نگو|نیاور|نباشد|نباشه|نشود|بیشتر از|کمتر از|اگر مطمئن نیستی|بدون|فقط)/, 'بگو چه چیزی نباشد: «کلمه سخت نگو»'],
  ];
  function promptlab(s, ctx) {
    const lights = h('div.lights', KEYS.map(([k, e]) => h('div.light', h('span', e), h('b', k))));
    const stars = h('div.stars');
    const tips = h('ul.tips');
    const warn = h('div.warn', { hidden: true }, '⛔ به نظر می‌رسد اطلاعات شخصی نوشته‌ای. نام، نشانی، تلفن و رمز را هرگز در پرامت ننویس.');
    const ta = h('textarea.ta', { rows: 5, placeholder: 'پرامتت را اینجا بنویس...', oninput: analyse, spellcheck: false });
    let best = 0;
    function analyse() {
      const t = ta.value; let n = 0; tips.innerHTML = '';
      KEYS.forEach(([k, , re, tip], i) => { const on = re.test(t); lights.children[i].classList.toggle('on', on); if (on) n++; else if (t.trim()) tips.appendChild(h('li', h('b', k + ': '), tip)); });
      stars.textContent = '★'.repeat(n) + '☆'.repeat(5 - n);
      warn.hidden = !/(شماره (تلفن|موبایل|کارت)|آدرس|نشانی خانه|رمز|کد ملی)/.test(t);
      if (n > best) { best = n; Sfx.pop(); if (n >= 3) ctx.ready(); if (n === 5) { ctx.right(true, lights); U.toast('هر پنج کلید روشن شد! 🎉'); } }
    }
    stars.textContent = '☆☆☆☆☆';
    if (ctx.seen) ctx.ready();
    return h('div', title(s), intro(s.goal), lights, ta, stars, warn, tips,
      h('div.row', h('button.btn.ghost.small', { onclick: () => { ta.value = s.sample; analyse(); } }, 'یک نمونه ببینم'), h('button.btn.ghost.small', { onclick: () => { navigator.clipboard && navigator.clipboard.writeText(ta.value).then(() => U.toast('کپی شد.')); } }, 'کپی پرامت')));
  }
  // ------------------------------------------------------------- write: mission with optional live Persian checker
  const NOT_VERB = /^(میز|میوه|میدان|میهن|میلیون|میان|میانگین|میراث|میل|میخ|میش|میزان|میمون|میهمان|میکروب|مینا|میکروسکوپ|میلاد|میگو|میلی|میتر|میرزا|میهما)/;
  const SHEKASTE = /(^|[\s«(])(میخوام|میخوای|میخواد|میخوایم|میشه|نمیشه|اومد|اومدن|اومدم|خونه|خونم|میدونم|نمیدونم|چیکار|اگه|بدین|بگین|نمیتونم|نمیتونیم|میتونم|بخونم|بخونیم|بکنن|تموم|آخه|بعدش|یه|اینو|اونو|تحقیقمو|بدم|خوبه|میکنن|میرم|نمیخوام)(?=$|[\s.،؛؟!»)])/g;
  const RULES = [
    [/(^|[\s«(])(ن?می) (?=[؀-ۿ])/g, '«می» را با نیم‌فاصله بچسبان: «می‌روم»'],
    [/([؀-ۿ]) (ها|های|هایی|تر|ترین)(?=$|[\s.،؛؟!:»)])/g, '«ها» و «تر» با نیم‌فاصله: «کتاب‌ها»، «بزرگ‌تر»'],
    [/می‌?باشد|می‌?باشند|میباشیم/g, 'به‌جای «می‌باشد» بنویس «است»'],
    [/گردید/g, 'به‌جای «گردید» بنویس «شد»'],
    [/توسط/g, 'به‌جای «توسط»، کننده کار را اول جمله بیاور'],
    [/(^|\s)جهت(?=\s)/g, 'به‌جای «جهت» بنویس «برای»'],
    [/مورد [؀-ۿ‌]+ قرار (گرفت|دادیم|داد|گیرد)/g, 'ساده کن: «بررسی شد»، «استفاده کردیم»'],
    [/ +[،؛؟!.:](?![.])/g, 'پیش از نشانه فاصله نگذار'],
    [/[،؛؟!:](?=[؀-ۿ])/g, 'بعد از نشانه یک فاصله بگذار'],
    [/[?,;]/g, 'نشانه فارسی بگذار: ؟ ، ؛'],
    [/[يك]/g, 'حرف «ی» و «ک» فارسی بنویس'],
    [/ {2,}/g, 'فاصله اضافه'],
    [/[؟!?]{2,}/g, 'یک نشانه کافی است'],
    [SHEKASTE, 'شکسته‌نویسی؛ در نوشته رسمی کامل بنویس'],
  ];
  function lint(text) {
    const hits = [];
    RULES.forEach(([re, msg]) => { re.lastIndex = 0; let m; while ((m = re.exec(text))) { const off = m[1] && /^[\s«(]$/.test(m[1]) ? m[1].length : 0; hits.push([m.index + off, m.index + m[0].length, msg]); if (!m[0].length) re.lastIndex++; } });
    // «می» stuck to the verb without a half-space: میخوانم
    const wre = /[؀-ۿ‌]+/g; let w;
    while ((w = wre.exec(text))) { const t = w[0]; if (/^ن?می[^‌]/.test(t) && t.length > 4 && !NOT_VERB.test(t.replace(/^ن/, ''))) hits.push([w.index, w.index + t.length, '«می» را با نیم‌فاصله بنویس: «می‌خوانم»']); }
    text.split(/[.؟!\n]/).forEach((sent) => { const n = sent.trim().split(/\s+/).filter(Boolean).length; if (n > 26) { const i = text.indexOf(sent.trim()); hits.push([i, i + sent.trim().length, 'جمله خیلی بلند است؛ آن را بشکن']); } });
    const tail = text.trim(); if (tail.length > 15 && !/[.؟!»:]$/.test(tail)) hits.push([text.length - 1, text.length, 'جمله آخر را با نقطه تمام کن']);
    hits.sort((a, b) => a[0] - b[0]);
    const clean = []; let end = -1; hits.forEach((x) => { if (x[0] >= end) { clean.push(x); end = x[1]; } });
    return clean;
  }
  function write(s, ctx) {
    const key = ctx.course.id + ':' + ctx.key;
    const ta = h('textarea.ta', { rows: 6, placeholder: 'اینجا بنویس...', spellcheck: false });
    ta.value = (Store.data.drafts[key]) || (s.given || '');
    const view = h('div.lint-view');
    const list = h('ul.lint-list');
    const meter = h('div.para-meter');
    const checks = h('div.checks', s.checks.map((c) => h('label.check-item', h('input', { type: 'checkbox', onchange: upd }), h('span', c))));
    const status = h('div.lint-status');
    let done = ctx.seen;
    function upd() {
      Store.data.drafts[key] = ta.value; Store.save();
      if (s.lint) {
        const hits = lint(ta.value); view.innerHTML = ''; list.innerHTML = '';
        let p = 0; const t = ta.value;
        hits.forEach(([a, b, msg]) => { view.append(t.slice(p, a), h('mark', { title: msg }, t.slice(a, b) || ' ')); p = b; });
        view.append(t.slice(p));
        const seen = {}; hits.forEach(([a, b, msg]) => (seen[msg] = (seen[msg] || 0) + 1));
        Object.entries(seen).forEach(([msg, n]) => list.appendChild(h('li', msg, n > 1 ? ` (${fa(n)} بار)` : '')));
        status.className = 'lint-status ' + (hits.length ? 'has' : 'clean');
        status.textContent = hits.length ? `ویراستار زنده ${fa(hits.length)} نکته پیدا کرد:` : (ta.value.trim().length > 15 ? 'ویراستار زنده غلطی پیدا نکرد. عالی! ✨' : '');
      }
      if (s.para) {
        const t = ta.value, n = t.split(/[.؟!]/).filter((x) => x.trim().length > 3).length;
        const parts = [['جمله موضوع', n >= 1], ['دلیل (زیرا)', /زیرا|چون|به این دلیل/.test(t)], ['مثال', /برای نمونه|مثلاً|مثلا|برای مثال/.test(t)], ['پایان (پس / در نتیجه)', /(^|\s)(پس|در نتیجه|در پایان|بنابراین)(\s|،)/.test(t)]];
        meter.replaceChildren(...parts.map(([k, on]) => h('span.layer' + (on ? '.on' : ''), on ? '✔ ' : '○ ', k)), h('span.count', `${fa(n)} جمله`));
      }
      const boxes = [...checks.querySelectorAll('input')];
      if (ta.value.trim().length >= 20 && boxes.every((b) => b.checked)) { if (!done) { done = true; ctx.right(true, checks); } }
    }
    ta.addEventListener('input', upd);
    const dl = h('button.btn.ghost.small', { onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([ta.value], { type: 'text/plain;charset=utf-8' })), download: (s.title || 'نوشته') + '.txt' }); document.body.appendChild(a); a.click(); a.remove(); } }, 'ذخیره در فایل');
    setTimeout(upd, 0);
    if (ctx.seen) ctx.ready();
    return h('div', title(s), h('div.mission-tag', '✍️ ماموریت'), h('p.task', s.task), ta, s.para ? meter : null,
      s.lint ? h('div.lint', status, view, list) : null, h('h3.mini', 'پیش از تحویل، خودت را بسنج:'), checks, h('div.row', dl),
      h('p.step-note', 'نوشته‌ات فقط روی همین دستگاه می‌ماند. اطلاعات شخصی ننویس. برای رفتن به مرحله بعد، همه موارد بالا را تیک بزن.'));
  }

  return { talk, cards, compare, gallery, lab, code, demo, quiz, tf, order, match, sort, spot, blanks, builder, promptlab, write, lint };
})();
