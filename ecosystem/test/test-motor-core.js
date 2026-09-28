// ecosystem/motor-core.js against spec 02 §7 (MD-1 to MD-11), in SI. Loaded by test.js.
'use strict';
const M = require('../motor-core.js');
let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (detail ? ': ' + detail : '')); }
}
function near(name, got, exp) {
  const good = typeof got === 'number' && isFinite(got) &&
    (Math.abs(exp) < 1 ? Math.abs(got - exp) <= 0.01 : Math.abs(got - exp) / Math.abs(exp) <= 0.005);
  ok(name, good, 'got ' + got + ', expected ' + exp);
}
const rpm = M.radToRpm, rad = M.rpmToRad;
const base = { Ts: 2, w0: rad(300), k: 1, i: 3.14, eta: 0.90, TL: 0.68 };

console.log('Motor core: operating point (MD-1, MD-3, MD-8, MD-11)');
{
  const r = M.operate(base);
  near('MD-1 T_m', r.Tm, 0.241); near('MD-1 % stall', r.pct, 12.0);
  near('MD-1 N_m (rpm)', rpm(r.wm), 264); near('MD-1 N_out (rpm)', rpm(r.wout), 84.0);
  near('MD-1 P_out', r.Pout, 5.99); ok('MD-1 band continuous', r.band === 'continuous');
  const s = M.operate(Object.assign({}, base, { TL: 6 }));
  near('MD-3 T_m', s.Tm, 2.12); ok('MD-3 stalled, N_out 0', s.stalled && s.wout === 0 && s.band === 'stalled');
  const p = M.operate(Object.assign({}, base, { k: 2 }));
  near('MD-8 combined stall', p.motor.Ts, 4); near('MD-8 T_m', p.Tm, 0.241); near('MD-8 % of combined stall', p.pct, 6.0);
  near('MD-8 N_m', rpm(p.wm), 282); near('MD-8 N_out', rpm(p.wout), 89.8);
  const z = M.operate(Object.assign({}, base, { TL: 0 }));
  ok('MD-11 T_L = 0: N_m = N₀, P_out = 0', Math.abs(rpm(z.wm) - 300) < 1e-9 && z.Pout === 0 && Number.isFinite(z.pct));
}

console.log('Motor core: ratio solver (MD-2, MD-6)');
{
  const s = M.solveRatio({ Ts: 2, w0: rad(300), eta: 0.9, TL: 0.68, wTarget: rad(95.5) });
  near('MD-2 i_high', s.iHigh, 2.70); near('MD-2 i_low', s.iLow, 0.439);
  near('MD-2 i_low % stall', s.pctLow, 86.0); near('MD-2 i_high % stall (exact root)', s.pctHigh, 13.98);
  const r = M.operate(Object.assign({}, base, { i: 2.70 }));
  near('MD-2 N_out at i = 2.70', rpm(r.wout), 95.5);
  const x = M.solveRatio({ Ts: 2, w0: rad(300), eta: 0.9, TL: 2, wTarget: rad(200) });
  ok('MD-6 D < 0, no ratio', x.D < 0 && x.feasible === false && x.iHigh === null);
  const z = M.solveRatio({ Ts: 2, w0: rad(300), eta: 0.9, TL: 0, wTarget: rad(100) });
  ok('no load: i_high = N₀/N_out, no low root', Math.abs(z.iHigh - 3) < 1e-9 && z.iLow === null);
  const units = M.solveRatio({ Ts: 2, w0: 300, eta: 0.9, TL: 0.68, wTarget: 95.5 });
  ok('solver is unit-agnostic in speed (rpm in, same roots)', Math.abs(units.iHigh - s.iHigh) < 1e-9);
}

console.log('Motor core: power, electrical, gearing, loads (MD-4, MD-5, MD-7, MD-9)');
{
  const m = M.motor({ Ts: 2, w0: rad(300) });
  near('MD-4 P_max', m.Pmax, 15.7); near('MD-4 at torque', m.TatPmax, 1.00); near('MD-4 at speed (rpm)', rpm(m.wAtPmax), 150);
  near('power at half stall equals P_max', M.powerAt(m, 1), m.Pmax);
  const op = M.operate({ Ts: 2, w0: rad(300), i: 1, eta: 1, TL: 0.5 });
  const e = M.electrical({ V: 12, I0: 0.2, Is: 10, Ts: 2, Tm: op.Tm, wm: op.wm });
  near('MD-5 I', e.I, 2.65); near('MD-5 N_m', rpm(op.wm), 225); near('MD-5 P_mech', e.Pmech, 11.8);
  near('MD-5 P_in', e.Pin, 31.8); near('MD-5 η_motor (%)', e.eff * 100, 37.0);
  near('MD-7 lift T_L', M.loadTorque({ type: 'lift', m: 5, r: 0.020 }), 0.981);
  near('force at radius', M.loadTorque({ type: 'force', F: 22.6, r: 0.030 }), 0.678);
  const gg = M.gearing([{ ratio: 3, efficiency: 0.95 }, { ratio: 4, efficiency: 0.95 }]);
  near('MD-9 i', gg.i, 12); near('MD-9 η', gg.eta, 0.9025);
  ok('duty bands', M.dutyBand(12) === 'continuous' && M.dutyBand(45) === 'short' && M.dutyBand(86) === 'avoid' && M.dutyBand(30) === 'continuous');
  ok('teacher band edges', M.dutyBand(25, { continuous: 20, short: 50 }) === 'short');
  const pr = M.nearestPair(2.702);
  ok('nearest gear pair to 2.702', pr && Math.abs(pr.ratio - 2.702) < 0.002, JSON.stringify(pr));
}

module.exports = { passed, failed };
