// Tests for ecosystem/anim.js with a fake frame clock. Loaded by test.js.
'use strict';
const Anim = require('../anim.js');
let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (detail ? ': ' + detail : '')); }
}
// A fake requestAnimationFrame: frames run only when the test calls flush(ms).
function fakeFrames() {
  let q = [], t = 0, n = 0;
  return {
    raf: fn => { q.push({ id: ++n, fn }); return n; },
    caf: id => { q = q.filter(x => x.id !== id); },
    now: () => t,
    frame(ms) { t += ms; const run = q; q = []; run.forEach(x => x.fn(t)); },
    pending: () => q.length,
  };
}

console.log('Anim: clock');
{
  const F = fakeFrames(); let steps = 0;
  const a = Anim.create({ raf: F.raf, caf: F.caf, now: F.now, reduced: () => false, step: () => { steps++; } });
  ok('start runs the loop', a.start() === true && a.running && F.pending() === 1);
  F.frame(16);                                     // first frame only sets the reference time
  for (let i = 0; i < 60; i++) F.frame(1000 / 60);
  ok('one second of frames is one second of simulation', Math.abs(a.time - 1) < 1e-9, a.time);
  a.setScale(0.25);
  for (let i = 0; i < 60; i++) F.frame(1000 / 60);
  ok('quarter speed: one real second is 0.25 s of simulation', Math.abs(a.time - 1.25) < 1e-9, a.time);
  a.setScale(1);
  F.frame(5000);
  ok('a long gap (hidden tab) moves at most 0.1 s', Math.abs(a.time - 1.35) < 1e-9, a.time);
  a.stop();
  ok('stop ends the loop', !a.running && F.pending() === 0);
  ok('frames counted', steps === 121);
}

console.log('Anim: step can stop the clock on the computed time');
{
  const F = fakeFrames(); const tStop = 0.898; let stopped = 0, tEnd = null;
  const a = Anim.create({ raf: F.raf, caf: F.caf, now: F.now, reduced: () => false,
    step: (dt, t) => (t >= tStop ? (tEnd = t, false) : true), onStop: () => { stopped++; } });
  a.start(); F.frame(0);
  for (let i = 0; i < 200 && a.running; i++) F.frame(1000 / 60);
  ok('stops once', stopped === 1 && !a.running);
  ok('stop lands within one 60 Hz frame of t', tEnd - tStop >= 0 && tEnd - tStop < 1 / 60 + 1e-9, tEnd);
}

console.log('Anim: reduced motion and the manual clock');
{
  let told = 0;
  const r = Anim.create({ raf: () => 1, caf: () => { }, reduced: () => true, onReduced: () => { told++; } });
  ok('reduced motion does not start the loop', r.start() === false && !r.running && told === 1);
  const F = fakeFrames(); let steps = 0;
  const m = Anim.create({ raf: F.raf, caf: F.caf, now: F.now, reduced: () => false, step: () => { steps++; } });
  Anim.manual(true);
  m.start();
  ok('manual mode: start does not ask for frames', F.pending() === 0 && m.running);
  F.frame(1000);
  ok('manual mode: real frames do nothing', m.time === 0);
  m.advance(0.5);
  ok('advance moves time exactly', Math.abs(m.time - 0.5) < 1e-12 && steps === 30, m.time + ' / ' + steps);
  Anim.advanceAll(0.25);
  ok('advanceAll moves every running clock', Math.abs(m.time - 0.75) < 1e-12);
  Anim.manual(false);
  ok('leaving manual mode resumes frames', F.pending() === 1);
  m.reset();
  ok('reset stops and zeroes', !m.running && m.time === 0);
}

module.exports = { passed, failed };
