// Spec 05 §9: shared fixtures for the Conveyor Designer, run through MotorCore and
// BeamCore directly. ConveyorDesigner/dev/test.js runs the same file through its
// own core and checks the results are identical. Loaded by test.js.
'use strict';
const MC = require('../motor-core.js');
const BC = require('../beam-core.js');
const F = require('./fixtures/conveyor-shared.json');
let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (detail ? ': ' + detail : '')); }
}
function near(name, got, exp) {
  const good = typeof got === 'number' && isFinite(got) && (Math.abs(exp) < 1 ? Math.abs(got - exp) <= 0.01 : Math.abs(got - exp) / Math.abs(exp) <= 0.005);
  ok(name, good, 'got ' + got + ', expected ' + exp);
}
console.log('Shared conveyor fixtures (spec 05 §9) through MotorCore and BeamCore');
for (const c of F.motor) {
  const w0 = MC.rpmToRad(c.N0);
  if (c.ratio) {
    const op = MC.operate({ Ts: c.Ts, w0, k: 1, i: c.ratio, eta: c.eta, TL: c.TL, r: c.D / 2 });
    near(c.id + ' loaded output speed', MC.radToRpm(op.wout), c.expect.Nout);
    near(c.id + ' belt speed', op.v, c.expect.vBelt);
    near(c.id + ' speed error %', (op.v - c.vTarget) / c.vTarget * 100, c.expect.speedErr);
  } else {
    const sv = MC.solveRatio({ Ts: c.Ts, w0, k: 1, eta: c.eta, TL: c.TL, wTarget: MC.rpmToRad(c.Np) });
    near(c.id + ' i_high', sv.iHigh, c.expect.iHigh);
    near(c.id + ' belt speed at i_high', MC.operate({ Ts: c.Ts, w0, k: 1, i: sv.iHigh, eta: c.eta, TL: c.TL, r: c.D / 2 }).v, c.expect.vBelt);
  }
}
for (const c of F.shaft) {
  const r = BC.analyze({ L: c.Lb, loads: [{ P: c.R, a: c.Lb / 2 }], mode: 'shaft', torque: { T: c.T, from: 0, to: c.Lb / 2 }, d: c.d, Sy: c.Sy, rule: 'tresca' });
  near(c.id + ' M', r.critical.M, c.expect.M);
  near(c.id + ' τ_max', r.critical.tauMax, c.expect.tauMax);
  near(c.id + ' n', r.n, c.expect.n);
  near(c.id + ' bearing A', r.RA, c.expect.RA); near(c.id + ' bearing B', r.RB, c.expect.RB);
}
module.exports = { passed, failed };
