// Tests for ecosystem/stats.js. Loaded by test.js.
'use strict';
const St = require('../stats.js');
let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (detail ? ': ' + detail : '')); }
}
// 00 §10 tolerance.
function near(name, got, exp) {
  const good = typeof got === 'number' && isFinite(got) && (Math.abs(exp) < 1 ? Math.abs(got - exp) <= 0.01 : Math.abs(got - exp) / Math.abs(exp) <= 0.005);
  ok(name, good, 'got ' + got + ', expected ' + exp);
}
const close = (name, got, exp, eps) => ok(name, typeof got === 'number' && Math.abs(got - exp) <= (eps || 1e-12), 'got ' + got + ', expected ' + exp);

console.log('Stats: summary statistics');
{
  // FS-3: measured slip angles 20°, 21°, 19° give μ = tan θ.
  const mus = [20, 21, 19].map(d => Math.tan(d * Math.PI / 180));
  near('FS-3 μ at 20°', mus[0], 0.364);
  near('FS-3 μ at 21°', mus[1], 0.384);
  near('FS-3 μ at 19°', mus[2], 0.344);
  near('FS-3 mean μ', St.mean(mus), 0.364);
  const s = St.summary(mus);
  ok('summary counts and range', s.n === 3 && s.min === mus[2] && s.max === mus[1] && Math.abs(s.range - (mus[1] - mus[2])) < 1e-15);
  close('sample sd of 2, 4, 4, 4, 5, 5, 7, 9', St.stdDev([2, 4, 4, 4, 5, 5, 7, 9]), Math.sqrt(32 / 7));
  close('population sd of 2, 4, 4, 4, 5, 5, 7, 9', St.stdDev([2, 4, 4, 4, 5, 5, 7, 9], { sample: false }), 2);
  ok('sample sd of one value is not defined', St.stdDev([3]) === null);
  ok('empty mean is not defined', St.mean([]) === null);
  ok('non-numbers are ignored', St.mean([1, NaN, 3, null, undefined, '7']) === 2);
}

console.log('Stats: median and quantiles');
{
  ok('odd count median', St.median([5, 1, 3]) === 3);
  ok('even count median', St.median([4, 1, 3, 2]) === 2.5);
  ok('median ignores order and non-numbers', St.median([10, NaN, -2, 4]) === 4);
  ok('median of nothing is not defined', St.median([]) === null);
  ok('quartile by interpolation', St.quantile([1, 2, 3, 4, 5], 0.25) === 2);
  ok('quantile out of range', St.quantile([1, 2], 1.5) === null);
  // The Collector reports a median, not a mean: one wild prediction must not swamp it.
  ok('median resists a wild value', St.median([3, 4, 5, 6, 900]) === 5 && St.mean([3, 4, 5, 6, 900]) > 100);
}

console.log('Stats: quadratic fit (FB-6)');
{
  // FB-6: 240 fps; frames and cumulative turns of a marker.
  const frames = [0, 120, 240, 360, 480, 600, 720], turns = [0, 2.3011, 4.2042, 5.7095, 6.8169, 7.5264, 7.8380];
  const t = frames.map(f => f / 240), th = turns.map(n => 2 * Math.PI * n);
  const f = St.polyfit2(t, th);
  near('FB-6 ω₀ = 31.4 rad/s', f.c1, 31.4);
  near('FB-6 ω₀ is 300 rpm', f.c1 * 60 / (2 * Math.PI), 300);
  near('FB-6 α = −10.0 rad/s²', 2 * f.c2, -10.0);
  ok('FB-6 R² = 1.000 within rounding', f.r2 > 0.99999 && f.r2 <= 1, 'R² ' + f.r2);
  ok('FB-6 residuals are tiny', f.residuals.every(r => Math.abs(r) < 0.01));
  ok('FB-6 uses 7 points', f.n === 7);
  // An exact parabola far from t = 0, where an uncentred fit loses precision.
  const T = [1000, 1001, 1002, 1003, 1004], Y = T.map(x => 3 - 2 * x + 0.5 * x * x);
  const g = St.polyfit2(T, Y);
  close('exact parabola c2 far from t = 0', g.c2, 0.5, 1e-6);
  close('exact parabola c1 far from t = 0', g.c1, -2, 1e-3);
  ok('exact parabola R² = 1', Math.abs(g.r2 - 1) < 1e-12);
  // FB-10.
  ok('FB-10 fewer than 3 points', St.polyfit2([0, 1], [0, 1]).error === 'Add at least three data points to fit a curve.');
  ok('three points at only two times', /three different times/.test(St.polyfit2([0, 1, 1], [0, 1, 2]).error));
  ok('non-numbers are skipped before counting', St.polyfit2([0, NaN, 1], [0, 5, 1]).error === 'Add at least three data points to fit a curve.');
  ok('flat data gives R² = 1, not NaN', St.polyfit2([0, 1, 2], [4, 4, 4]).r2 === 1);
}

console.log('Stats: linear solver');
{
  const x = St.solve([[2, 1], [1, 3]], [3, 5]);
  close('2×2 solve x', x[0], 0.8); close('2×2 solve y', x[1], 1.4);
  ok('singular system gives null', St.solve([[1, 2], [2, 4]], [1, 2]) === null);
}

module.exports = { passed, failed };
