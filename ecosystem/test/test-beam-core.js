// ecosystem/beam-core.js against spec 01 §8 (SB-1 to SB-14). Loaded by test.js.
// The core is SI; these tests convert at the edges exactly as the tool does.
'use strict';
const B = require('../beam-core.js');
let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (detail ? ': ' + detail : '')); }
}
function near(name, got, exp) {   // 00 §10
  const good = typeof got === 'number' && isFinite(got) &&
    (Math.abs(exp) < 1 ? Math.abs(got - exp) <= 0.01 : Math.abs(got - exp) / Math.abs(exp) <= 0.005);
  ok(name, good, 'got ' + got + ', expected ' + exp);
}
const mm = v => v / 1000, MPa = 1e6, GPa = 1e9;
const toMPa = v => v / MPa, toNm = v => v, toMM = v => v * 1000;
const rpmToRad = n => n * 2 * Math.PI / 60;
const base = o => Object.assign({ mode: 'beam', L: mm(300), loads: [], d: mm(20), Sy: 400 * MPa, nTarget: 2, rule: 'tresca' }, o);

console.log('Beam core: statics and diagrams (SB-1 to SB-3)');
{
  const r = B.analyze(base({ L: mm(300), loads: [{ P: 1000, a: mm(150) }] }));
  near('SB-1 R_A', r.RA, 500); near('SB-1 R_B', r.RB, 500);
  near('SB-1 |M|max (N·m)', Math.abs(r.Mmax.M), 75.0); near('SB-1 station (mm)', toMM(r.Mmax.x), 150);
  ok('SB-1 at least 400 stations', r.xs.length >= 401);
  ok('SB-1 shear +500 then −500', Math.abs(B.shearAt(mm(100), mm(300), [{ P: 1000, a: mm(150) }], r.R) - 500) < 1e-9 && Math.abs(B.shearAt(mm(200), mm(300), [{ P: 1000, a: mm(150) }], r.R) + 500) < 1e-9);
  ok('SB-1 shear polyline has both sides of the jump', r.shearPts.filter(p => Math.abs(p.x - mm(150)) < 1e-12).map(p => p.V).join() === '500,-500');
}
{
  const r = B.analyze(base({ L: mm(2000), loads: [{ P: 600, a: mm(500) }] }));
  near('SB-2 R_A', r.RA, 450); near('SB-2 R_B', r.RB, 150);
  near('SB-2 |M|max (N·m)', Math.abs(r.Mmax.M), 225); near('SB-2 station (mm)', toMM(r.Mmax.x), 500);
}
{
  const r = B.analyze(base({ L: mm(200), overhangRight: mm(50), loads: [{ P: 100, a: mm(250) }] }));
  near('SB-3 R_B (up)', r.RB, 125); near('SB-3 R_A (pulled down)', r.RA, -25);
  near('SB-3 |M|max (N·m)', Math.abs(r.Mmax.M), 5.00); near('SB-3 station (mm)', toMM(r.Mmax.x), 200);
  ok('SB-3 moment at B is hogging (negative)', r.Mmax.M < 0);
  near('SB-3 moment at free end is 0', B.momentAt(mm(250), mm(200), [{ P: 100, a: mm(250) }], r.R), 0);
}

console.log('Beam core: section checks through the test hook (SB-4, SB-5, SB-8)');
{
  const Tr = B.section({ M: 1000, T: 1000, d: mm(41.6), Sy: 400 * MPa, nTarget: 2, rule: 'tresca' });
  near('SB-4 required d Tresca (mm)', toMM(B.requiredDiameter({ M: 1000, T: 1000, Sy: 400 * MPa, n: 2, rule: 'tresca' })), 41.6);
  near('SB-4 σ at 41.6 mm', toMPa(Tr.sigma), 141.5); near('SB-4 τ at 41.6 mm', toMPa(Tr.tau), 70.7);
  near("SB-4 σ' at 41.6 mm", toMPa(Tr.sigmaVM), 187);
  near('SB-5 required d von Mises (mm)', toMM(B.requiredDiameter({ M: 1000, T: 1000, Sy: 400 * MPa, n: 2, rule: 'vonMises' })), 40.7);
  const r8 = B.analyze(base({ mode: 'shaft', L: mm(300), loads: [], torque: { T: 10, from: 0, to: mm(300) }, Sy: 100 * MPa, nTarget: 1 }));
  near('SB-8 required d, torque only (mm)', toMM(r8.dReq), 10.06);
}

console.log('Beam core: shaft example (SB-6, SB-7, SB-9, SB-10, SB-12)');
const T6 = 500 / rpmToRad(300);
const sb6 = o => base(Object.assign({ mode: 'shaft', L: mm(300), loads: [{ P: 1000, a: mm(150) }], torque: { T: T6, from: 0, to: mm(150) } }, o));
{
  const r = B.analyze(sb6());
  near('SB-6 T (N·m)', r.torque, 15.9);
  near('SB-6 critical station (mm)', toMM(r.critical.x), 150);
  near('SB-6 σ', toMPa(r.critical.sigma), 95.5); near('SB-6 τ', toMPa(r.critical.tau), 10.1);
  near('SB-6 τ_max', toMPa(r.critical.tauMax), 48.8); near('SB-6 n', r.n, 4.10);
  ok('SB-6 passes n = 2', r.pass === true);
  near('SB-6 required d for n = 2 (mm)', toMM(r.dReq), 15.7);
  const v = B.analyze(sb6({ rule: 'vonMises' }));
  near("SB-7 σ'", toMPa(v.critical.sigmaVM), 97.1); near('SB-7 n', v.n, 4.12);
  const r9 = B.analyze(sb6({ d: mm(40) }));
  ok('SB-9 σ exactly 1/8', Math.abs(r9.critical.sigma * 8 - r.critical.sigma) < 1e-6);
  ok('SB-9 τ exactly 1/8', Math.abs(r9.critical.tau * 8 - r.critical.tau) < 1e-6);
  ok('SB-9 τ_max exactly 1/8', Math.abs(r9.critical.tauMax * 8 - r.critical.tauMax) < 1e-6);
  near('SB-9 n', r9.n, 32.8);
  const r10 = B.analyze(sb6({ Kb: 2, Kt: 2 }));
  near('SB-10 τ_max', toMPa(r10.critical.tauMax), 97.6); near('SB-10 n', r10.n, 2.05);
  const r12 = B.analyze(sb6({ torque: { T: T6, from: mm(200), to: mm(300) } }));
  const at = x => r12.xs.findIndex(s => Math.abs(s - mm(x)) < 1e-12);
  const i150 = at(150), i200 = at(200);
  ok('SB-12 τ = 0 at 150 mm', r12.T[i150] === 0);
  const s150 = B.section({ M: r12.M[i150], T: r12.T[i150], d: mm(20), Sy: 400 * MPa });
  near('SB-12 τ_max = σ/2 at 150', toMPa(s150.tauMax), 47.7); near('SB-12 n at 150', s150.n, 4.19);
  near('SB-12 M at 200 (N·m)', r12.M[i200], 50.0);
  ok('SB-12 T at 200 is 15.9 (segment includes its end)', Math.abs(r12.T[i200] - T6) < 1e-12);
  near('SB-12 n at 200', r12.nArr[i200], 5.99);
  near('SB-12 critical station (mm)', toMM(r12.critical.x), 150); near('SB-12 critical n', r12.n, 4.19);
}

console.log('Beam core: deflection (SB-11)');
{
  const r = B.analyze(base({ L: mm(300), loads: [{ P: 1000, a: mm(150) }], E: 200 * GPa }));
  near('SB-11 I (mm⁴)', r.deflection.I * 1e12, 7854);
  near('SB-11 δ_max (mm)', toMM(r.deflection.max), 0.358);
  near('SB-11 station (mm)', toMM(r.deflection.x), 150);
  const exact = B.centeredDeflection(1000, mm(300), 200 * GPa, r.deflection.I);
  ok('SB-11 within 0.5% of PL³/48EI', Math.abs(r.deflection.max - exact) / exact < 0.005, r.deflection.max + ' vs ' + exact);
  ok('deflection is downward', r.deflection.maxSigned < 0);
  const ov = B.analyze(base({ L: mm(200), overhangRight: mm(50), loads: [{ P: 100, a: mm(250) }], E: 200 * GPa }));
  ok('overhang tip deflects down, span lifts', ov.deflection.y[ov.deflection.y.length - 1] < 0 && Math.max(...ov.deflection.y) > 0);
}

console.log('Beam core: edge cases (SB-14)');
{
  const r = B.analyze(base({ mode: 'shaft', loads: [], torque: { T: 0, from: 0, to: mm(300) } }));
  ok('SB-14 no load: n is null with a reason', r.n === null && r.nReason === 'no load');
  ok('SB-14 no load: required d is null', r.dReq === null);
  ok('SB-14 no Infinity or NaN in the arrays', r.M.concat(r.V, r.T).every(Number.isFinite));
  const m = B.analyze(base({ mode: 'beam', loads: [{ P: 1000, a: mm(150) }], torque: { T: 99, from: 0, to: mm(300) } }));
  ok('Beam mode ignores torque', m.torque === 0 && m.critical.tau === 0);
  const up = B.analyze(base({ loads: [{ P: -1000, a: mm(150) }] }));
  ok('upward load gives downward reactions', up.RA < 0 && up.RB < 0 && up.Mmax.M < 0);
  const noMat = B.analyze(base({ loads: [{ P: 1000, a: mm(150) }], d: undefined }));
  ok('missing diameter gives a reason, not NaN', noMat.n === null && noMat.nReason.startsWith('enter'));
}

module.exports = { passed, failed };
