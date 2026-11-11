/* Tiny sound effects made with the Web Audio API (no audio files). */
'use strict';
const Sfx = (() => {
  let ctx = null;
  let on = Store.pref('sound') !== 'off';
  const ac = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } return ctx; };
  function tone(f, t0, dur, type = 'sine', vol = 0.12) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, c.currentTime + t0); g.gain.linearRampToValueAtTime(vol, c.currentTime + t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g).connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
  }
  const play = (fn) => { if (!on) return; try { const c = ac(); if (c && c.state === 'suspended') c.resume(); fn(); } catch (e) { /* ignore */ } };
  return {
    get on() { return on; },
    toggle() { on = !on; Store.pref('sound', on ? 'on' : 'off'); return on; },
    click: () => play(() => tone(660, 0, 0.06, 'triangle', 0.06)),
    good: () => play(() => { tone(660, 0, 0.12, 'triangle'); tone(990, 0.09, 0.2, 'triangle'); }),
    bad: () => play(() => { tone(220, 0, 0.16, 'sawtooth', 0.05); tone(180, 0.1, 0.2, 'sawtooth', 0.05); }),
    pop: () => play(() => tone(880 + Math.random() * 200, 0, 0.07, 'sine', 0.07)),
    level: () => play(() => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.1))),
    type: () => play(() => tone(1200 + Math.random() * 300, 0, 0.02, 'square', 0.015)),
  };
})();
