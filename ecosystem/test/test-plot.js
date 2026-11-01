// Tests for ecosystem/plot.js. Loaded by test.js.
'use strict';
const P = require('../plot.js');
let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (detail ? ': ' + detail : '')); }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

console.log('Plot: ticks and scales');
{
  ok('step for 0 to 10 in 5', P.niceStep(10, 5) === 2);
  ok('step for 0 to 0.37 in 5', Math.abs(P.niceStep(0.37, 5) - 0.1) < 1e-15);
  ok('step for 0 to 31.4 in 6', P.niceStep(31.4, 6) === 10);
  const d1 = P.niceDomain(0, 0.37, { count: 5 });
  ok('0 to 0.37 widens to 0 to 0.4', Math.abs(d1.min) < 1e-12 && Math.abs(d1.max - 0.4) < 1e-12 && d1.ticks.length === 5, JSON.stringify(d1));
  const d2 = P.niceDomain(-12, 31.4, { count: 5 });
  ok('−12 to 31.4 widens to −20 to 40', d2.min === -20 && d2.max === 40 && d2.step === 10 && same(d2.ticks, [-20, -10, 0, 10, 20, 30, 40]), JSON.stringify(d2));
  const d3 = P.niceDomain(5, 5);
  ok('a single value gets a range around it', d3.min < 5 && d3.max > 5);
  const d4 = P.niceDomain(10, 2);
  ok('reversed bounds are swapped', d4.min <= 2 && d4.max >= 10);
  ok('includeZero', P.niceDomain(3, 8, { includeZero: true }).min === 0);
  ok('bad bounds fall back to 0 to 1', P.niceDomain(NaN, Infinity).max === 1);
  const s = P.scale(0, 10, 100, 300);
  ok('scale maps', s(5) === 200 && s.invert(250) === 7.5);
  const sy = P.scale(0, 1, 200, 0);
  ok('inverted scale for y', sy(1) === 0 && sy(0.25) === 150);
  ok('flat domain does not divide by zero', isFinite(P.scale(2, 2, 0, 100)(5)));
}

console.log('Plot: tick labels');
{
  ok('0.1 step shows one decimal', P.fmtTick(0.30000000000000004, 0.1) === '0.3');
  ok('10 step shows none', P.fmtTick(20, 10) === '20');
  ok('true minus sign', P.fmtTick(-20, 10) === '−20');
  ok('no negative zero', P.fmtTick(-1e-17, 0.1) === '0.0');
  ok('0.05 step shows two decimals', P.fmtTick(0.5, 0.05) === '0.50');
}

console.log('Plot: SVG output');
{
  const pal = { ink: '#111', inkSoft: '#555', line: '#ccc', fontUi: 'Avenir' };
  const f = P.frame({ width: 400, height: 260, x: [0, 3], y: [-12, 31.4], xLabel: 'Time t (s)', yLabel: 'Angle θ (rad)', pal, idp: 'fb1' });
  ok('frame has a box inside the margins', f.box.x === 52 && f.box.w === 400 - 52 - 14 && f.box.h === 260 - 12 - 40);
  ok('y scale is upward', f.sy(f.yd.max) === f.box.y && f.sy(f.yd.min) === f.box.y + f.box.h);
  ok('frame labels are escaped and present', f.svg.includes('Time t (s)') && f.svg.includes('Angle θ (rad)'));
  ok('clip id carries the prefix', f.clipId === 'fb1-clip' && f.defs.includes('id="fb1-clip"'));
  const pts = P.points([[0, 0], [1, NaN], [2, 5]], f.sx, f.sy, { fill: '#c00' });
  ok('points skip non-finite values', (pts.match(/<circle/g) || []).length === 2);
  ok('square and diamond shapes', P.points([[1, 1]], f.sx, f.sy, { shape: 'square' }).includes('<rect') && P.points([[1, 1]], f.sx, f.sy, { shape: 'diamond' }).includes('<polygon'));
  const ln = P.line([[0, 0], [1, 1], [2, NaN], [3, 3], [4, 4]], f.sx, f.sy, { dash: '4 3' });
  ok('line breaks at a gap', (ln.match(/<polyline/g) || []).length === 2 && ln.includes('stroke-dasharray="4 3"'));
  ok('sample covers the range', P.sample(x => x * x, 0, 2, 4).length === 5 && P.sample(x => x * x, 0, 2, 4)[4][1] === 4);
  const all = f.svg + pts + ln + P.refLine({ axis: 'y', value: 0, box: f.box, sx: f.sx, sy: f.sy, label: '0%' });
  ok('no NaN or Infinity in any SVG', !/NaN|Infinity|undefined/.test(all));
  ok('extent ignores non-finite values', same(P.extent([3, NaN, -1, Infinity, 7]), [-1, 7]) && P.extent([NaN]) === null);
}

module.exports = { passed, failed };
