#!/usr/bin/env node
// Independent recompute of every numeric expected value in the spec test tables
// (engineered-by-the-numbers-tool-specs/01..09). Uses only the formulas as the
// specs state them — no tool code — so a disagreement points at the spec, not
// at an implementation. Tolerance follows 00 §10: 0.5% relative, or 0.01 in
// the displayed unit for values under 1.
//
//   node scripts/check-spec-values.js          # summary + mismatches
//   node scripts/check-spec-values.js --all    # every check
'use strict';

const showAll = process.argv.includes('--all');
const PI = Math.PI;
const g = 9.81;
const rpm2rad = n => n * 2 * PI / 60;
const deg = d => d * PI / 180;
const cbrt = Math.cbrt;

const results = [];
function check(id, what, got, expected, note) {
  const ok = Math.abs(expected) < 1
    ? Math.abs(got - expected) <= 0.01 + 1e-12
    : Math.abs(got - expected) / Math.abs(expected) <= 0.005 + 1e-12;
  results.push({ id, what, got, expected, ok, note });
}
function truth(id, what, cond, note) {
  results.push({ id, what, got: cond, expected: true, ok: cond === true, note });
}

/* ------------------------------------------------------------------ 01 */
// Beam: loads P (N, + down) at a (mm). Supports at 0 and L. Returns N, N·mm.
function reactions(L, loads) {
  const RB = loads.reduce((s, l) => s + l.P * l.a, 0) / L;
  const RA = loads.reduce((s, l) => s + l.P, 0) - RB;
  return { RA, RB };
}
function moment(x, L, loads) {
  const { RA, RB } = reactions(L, loads);
  let M = 0;
  if (x >= 0) M += RA * x;
  if (x >= L) M += RB * (x - L);
  for (const l of loads) if (l.a <= x) M -= l.P * (x - l.a);
  return M;
}
function maxAbsM(L, loads, x0, x1) {
  let best = { M: 0, x: 0 };
  const xs = new Set([0, L, x0, x1, ...loads.map(l => l.a)]);
  for (let i = 0; i <= 4000; i++) xs.add(x0 + (x1 - x0) * i / 4000);
  for (const x of xs) { const M = moment(x, L, loads); if (Math.abs(M) > Math.abs(best.M)) best = { M, x }; }
  return best;
}
const trescaTmax = (M, T, d, Kb = 1, Kt = 1) => 16 / (PI * d ** 3) * Math.hypot(Kb * M, Kt * T); // N·mm, mm -> MPa
const reqD_tresca = (M, T, Sy, n, Kb = 1, Kt = 1) => cbrt(16 * Math.hypot(Kb * M, Kt * T) / (PI * Sy / (2 * n)));
const reqD_vm = (M, T, Sy, n, Kb = 1, Kt = 1) => cbrt((32 * n / (PI * Sy)) * Math.sqrt((Kb * M) ** 2 + 0.75 * (Kt * T) ** 2));
const sigmaB = (M, d, Kb = 1) => 32 * Kb * M / (PI * d ** 3);
const tauT = (T, d, Kt = 1) => 16 * Kt * T / (PI * d ** 3);

{
  let r = reactions(300, [{ P: 1000, a: 150 }]);
  check('SB-1', 'R_A (N)', r.RA, 500); check('SB-1', 'R_B (N)', r.RB, 500);
  let m = maxAbsM(300, [{ P: 1000, a: 150 }], 0, 300);
  check('SB-1', '|M|max (N·m)', Math.abs(m.M) / 1000, 75.0); check('SB-1', 'station (mm)', m.x, 150);

  r = reactions(2000, [{ P: 600, a: 500 }]);
  check('SB-2', 'R_A (N)', r.RA, 450); check('SB-2', 'R_B (N)', r.RB, 150);
  m = maxAbsM(2000, [{ P: 600, a: 500 }], 0, 2000);
  check('SB-2', '|M|max (N·m)', Math.abs(m.M) / 1000, 225); check('SB-2', 'station (mm)', m.x, 500);

  r = reactions(200, [{ P: 100, a: 250 }]);
  check('SB-3', 'R_B (N)', r.RB, 125); check('SB-3', 'R_A (N)', r.RA, -25);
  m = maxAbsM(200, [{ P: 100, a: 250 }], 0, 250);
  check('SB-3', '|M|max (N·m)', Math.abs(m.M) / 1000, 5.00); check('SB-3', 'station (mm)', m.x, 200);

  // SB-4/5: M = T = 1e6 N·mm, Sy 400, n 2
  const d4 = reqD_tresca(1e6, 1e6, 400, 2);
  check('SB-4', 'required d Tresca (mm)', d4, 41.6);
  check('SB-4', 'σ at 41.6 mm (MPa)', sigmaB(1e6, 41.6), 141.5);
  check('SB-4', 'τ at 41.6 mm (MPa)', tauT(1e6, 41.6), 70.7);
  check('SB-4', "σ' at 41.6 mm (MPa)", Math.hypot(sigmaB(1e6, 41.6), Math.sqrt(3) * tauT(1e6, 41.6)), 187);
  check('SB-5', 'required d von Mises (mm)', reqD_vm(1e6, 1e6, 400, 2), 40.7);

  // SB-6
  const T6 = 500 / rpm2rad(300) * 1000; // N·mm
  const M6 = moment(150, 300, [{ P: 1000, a: 150 }]);
  check('SB-6', 'T (N·m)', T6 / 1000, 15.9);
  check('SB-6', 'σ (MPa)', sigmaB(M6, 20), 95.5);
  check('SB-6', 'τ (MPa)', tauT(T6, 20), 10.1);
  check('SB-6', 'τ_max (MPa)', trescaTmax(M6, T6, 20), 48.8);
  check('SB-6', 'n', 400 / (2 * trescaTmax(M6, T6, 20)), 4.10);
  check('SB-6', 'required d for n=2 (mm)', reqD_tresca(M6, T6, 400, 2), 15.7);
  const sv7 = Math.hypot(sigmaB(M6, 20), Math.sqrt(3) * tauT(T6, 20));
  check('SB-7', "σ' (MPa)", sv7, 97.1); check('SB-7', 'n', 400 / sv7, 4.12);
  check('SB-8', 'required d (mm)', reqD_tresca(0, 10000, 100, 1), 10.06);
  check('SB-9', 'n at d=40', 400 / (2 * trescaTmax(M6, T6, 40)), 32.8);
  truth('SB-9', 'τ_max ratio exactly 1/8', Math.abs(trescaTmax(M6, T6, 40) * 8 - trescaTmax(M6, T6, 20)) < 1e-9);
  check('SB-10', 'τ_max Kb=Kt=2 (MPa)', trescaTmax(M6, T6, 20, 2, 2), 97.6);
  check('SB-10', 'n', 400 / (2 * trescaTmax(M6, T6, 20, 2, 2)), 2.05);
  const I11 = PI * 20 ** 4 / 64;
  check('SB-11', 'I (mm⁴)', I11, 7854);
  check('SB-11', 'δ_max (mm)', 1000 * 300 ** 3 / (48 * 200000 * I11), 0.358);
  // SB-12: torque only on 200..300
  const tm150 = trescaTmax(M6, 0, 20);
  check('SB-12', 'τ_max at 150 (MPa)', tm150, 47.7);
  check('SB-12', 'n at 150', 400 / (2 * tm150), 4.19);
  const M200 = moment(200, 300, [{ P: 1000, a: 150 }]);
  check('SB-12', 'M at 200 (N·m)', M200 / 1000, 50.0);
  check('SB-12', 'n at 200', 400 / (2 * trescaTmax(M200, T6, 20)), 5.99);
  let worst = { n: Infinity, x: 0 };
  for (let i = 0; i <= 3000; i++) {
    const x = i / 10; const T = (x >= 200 && x <= 300) ? T6 : 0;
    const tm = trescaTmax(moment(x, 300, [{ P: 1000, a: 150 }]), T, 20);
    const n = tm > 0 ? 400 / (2 * tm) : Infinity;
    if (n < worst.n) worst = { n, x };
  }
  check('SB-12', 'critical station (mm)', worst.x, 150); check('SB-12', 'critical n', worst.n, 4.19);
}

/* ------------------------------------------------------------------ 02 */
function motorOp({ Ts, N0, i, eta, TL, k = 1 }) {
  const Tstall = k * Ts;
  const Tm = TL / (i * eta);
  if (Tm >= Tstall) return { stalled: true, Tm, pct: Tm / Tstall * 100, Nm: 0, Nout: 0 };
  const Nm = N0 * (1 - Tm / Tstall);
  const Nout = Nm / i;
  return { stalled: false, Tm, pct: Tm / Tstall * 100, Nm, Nout, Pout: TL * rpm2rad(Nout) };
}
function ratioSolve({ Ts, N0, eta, TL, Nt }) {
  const D = N0 ** 2 - 4 * Nt * N0 * TL / (eta * Ts);
  if (D < 0) return { D };
  return { D, hi: (N0 + Math.sqrt(D)) / (2 * Nt), lo: (N0 - Math.sqrt(D)) / (2 * Nt) };
}
{
  const m1 = motorOp({ Ts: 2, N0: 300, i: 3.14, eta: 0.9, TL: 0.68 });
  check('MD-1', 'T_m (N·m)', m1.Tm, 0.241); check('MD-1', '% stall', m1.pct, 12.0);
  check('MD-1', 'N_m (rpm)', m1.Nm, 264); check('MD-1', 'N_out (rpm)', m1.Nout, 84.0);
  check('MD-1', 'P_out (W)', m1.Pout, 5.99); truth('MD-1', 'continuous band (<30%)', m1.pct <= 30);
  const s2 = ratioSolve({ Ts: 2, N0: 300, eta: 0.9, TL: 0.68, Nt: 95.5 });
  check('MD-2', 'i_high', s2.hi, 2.70); check('MD-2', 'i_low', s2.lo, 0.439);
  check('MD-2', 'i_low % stall', motorOp({ Ts: 2, N0: 300, i: s2.lo, eta: 0.9, TL: 0.68 }).pct, 86.0);
  const m2 = motorOp({ Ts: 2, N0: 300, i: 2.70, eta: 0.9, TL: 0.68 });
  check('MD-2', 'N_out at i=2.70 (rpm)', m2.Nout, 95.5);
  check('MD-2', '% stall at i=2.70 (spec 13.98)', m2.pct, 13.98, 'rounded ratio 2.70 gives 13.99; exact root gives 13.98');
  check('MD-2', '% stall at exact i_high', motorOp({ Ts: 2, N0: 300, i: s2.hi, eta: 0.9, TL: 0.68 }).pct, 13.98);
  const m3 = motorOp({ Ts: 2, N0: 300, i: 3.14, eta: 0.9, TL: 6 });
  check('MD-3', 'T_m (N·m)', m3.Tm, 2.12); truth('MD-3', 'stalled', m3.stalled);
  check('MD-4', 'P_max (W)', 2 * rpm2rad(300) / 4, 15.7);
  // MD-5
  const Tm5 = 0.5, I5 = 0.2 + (10 - 0.2) * Tm5 / 2, Nm5 = 300 * (1 - Tm5 / 2);
  const Pm5 = Tm5 * rpm2rad(Nm5), Pin5 = 12 * I5;
  check('MD-5', 'I (A)', I5, 2.65); check('MD-5', 'N_m (rpm)', Nm5, 225);
  check('MD-5', 'P_mech (W)', Pm5, 11.8); check('MD-5', 'P_in (W)', Pin5, 31.8);
  check('MD-5', 'η_motor (%)', Pm5 / Pin5 * 100, 37.0);
  truth('MD-6', 'D < 0', ratioSolve({ Ts: 2, N0: 300, eta: 0.9, TL: 2, Nt: 200 }).D < 0);
  check('MD-7', 'T_L lift (N·m)', 5 * g * 0.020, 0.981);
  const m8 = motorOp({ Ts: 2, N0: 300, i: 3.14, eta: 0.9, TL: 0.68, k: 2 });
  check('MD-8', 'T_m (N·m)', m8.Tm, 0.241); check('MD-8', '% combined stall', m8.pct, 6.0);
  check('MD-8', 'N_m (rpm)', m8.Nm, 282); check('MD-8', 'N_out (rpm)', m8.Nout, 89.8);
  check('MD-9', 'i', 3 * 4, 12); check('MD-9', 'η', 0.95 * 0.95, 0.9025);
  check('MD-10', '200 N·cm in N·m', 200 / 100, 2);
}

/* ------------------------------------------------------------------ 03 */
function screw({ W, d, p, n = 1, alphaDeg = 0, mu, muc = 0, dc = 0, R = 300, dm, dr }) {
  const l = n * p; dm = dm ?? d - p / 2; dr = dr ?? d - p;
  const mup = mu / Math.cos(deg(alphaDeg));
  const k = W * dm / 2;                                   // N·mm
  const TRs = k * (l + PI * mup * dm) / (PI * dm - mup * l);
  const TLs = k * (PI * mup * dm - l) / (PI * dm + mup * l);
  const Tc = W * muc * dc / 2;
  const TR = TRs + Tc, TL = TLs + Tc;
  return {
    l, dm, dr, mup, lam: Math.atan(l / (PI * dm)) * 180 / PI, phi: Math.atan(mup) * 180 / PI,
    TRs, TLs, Tc, TR, TL, F: TR / R, Fideal: W * l / (2 * PI * R), e: W * l / (2 * PI * TR),
    selfLock: PI * mup * dm > l, holds: TL >= 0,
    sigma: 4 * W / (PI * dr ** 2), tau: 16 * TRs / (PI * dr ** 3),
  };
}
{
  check('FS-1', 'slip angle (deg)', Math.atan(0.36) * 180 / PI, 19.8);
  check('FS-2', 'a (m/s²)', g * (Math.sin(deg(30)) - 0.30 * Math.cos(deg(30))), 2.36);
  const mus = [20, 21, 19].map(a => Math.tan(deg(a)));
  check('FS-3', 'μ(20°)', mus[0], 0.364); check('FS-3', 'μ(21°)', mus[1], 0.384); check('FS-3', 'μ(19°)', mus[2], 0.344);
  check('FS-3', 'mean', mus.reduce((a, b) => a + b) / 3, 0.364);
  const s4 = screw({ W: 2000, d: 20, p: 4, mu: 0.15 });
  check('FS-4', 'l', s4.l, 4); check('FS-4', 'd_m', s4.dm, 18); check('FS-4', 'd_r', s4.dr, 16);
  check('FS-4', 'λ (deg)', s4.lam, 4.05); check('FS-4', 'φ (deg)', s4.phi, 8.53);
  check('FS-4', 'T_R (N·m)', s4.TR / 1000, 4.02); check('FS-4', 'T_L (N·m)', s4.TL / 1000, 1.41);
  check('FS-4', 'F (N)', s4.F, 13.4); check('FS-4', 'F_ideal (N)', s4.Fideal, 4.24);
  check('FS-4', 'e (%)', s4.e * 100, 31.7); truth('FS-4', 'self-locking', s4.selfLock);
  check('FS-4', 'σ (MPa)', s4.sigma, 9.95); check('FS-4', 'τ (MPa)', s4.tau, 4.99);
  check('FS-4', 'tangent-sum form T_R (N·m)', 2000 * 18 / 2 * Math.tan(deg(s4.phi + s4.lam)) / 1000, 4.02);
  const s5 = screw({ W: 2000, d: 20, p: 4, mu: 0.15, alphaDeg: 14.5 });
  check('FS-5', "μ'", s5.mup, 0.155); check('FS-5', 'T_R (N·m)', s5.TR / 1000, 4.11);
  check('FS-5', 'T_L (N·m)', s5.TL / 1000, 1.50); check('FS-5', 'e (%)', s5.e * 100, 31.0); truth('FS-5', 'self-locking', s5.selfLock);
  const s6 = screw({ W: 2000, d: 20, p: 4, n: 4, mu: 0.05 });
  check('FS-6', 'l', s6.l, 16); check('FS-6', 'T_R (N·m)', s6.TR / 1000, 6.08);
  check('FS-6', 'T_L (N·m)', s6.TL / 1000, -4.13); check('FS-6', 'e (%)', s6.e * 100, 83.8);
  truth('FS-6', 'not self-locking', !s6.selfLock);
  const s7 = screw({ W: 6400, d: 32, p: 4, n: 2, mu: 0.08, muc: 0.08, dc: 40 });
  check('FS-7', 'd_m', s7.dm, 30); check('FS-7', 'l', s7.l, 8);
  check('FS-7', 'T_R screw (N·m)', s7.TRs / 1000, 15.94); check('FS-7', 'collar (N·m)', s7.Tc / 1000, 10.24);
  check('FS-7', 'T_R total (N·m)', s7.TR / 1000, 26.18); check('FS-7', 'T_L screw (N·m)', s7.TLs / 1000, -0.466);
  check('FS-7', 'T_L total (N·m)', s7.TL / 1000, 9.77); check('FS-7', 'e (%)', s7.e * 100, 31.1);
  truth('FS-8', 'thread not self-locking', !s7.selfLock); truth('FS-8', 'holds with collar', s7.holds);
  // FS-9 bisection
  let lo = 0, hi = 1;
  for (let k = 0; k < 100; k++) { const m = (lo + hi) / 2; (screw({ W: 2000, d: 20, p: 4, mu: m }).TR < 20 * 300) ? lo = m : hi = m; }
  check('FS-9', 'back-calc μ', lo, 0.257); check('FS-9', 'measured e (%)', 2000 * 4 / (2 * PI * 20 * 300) * 100, 21.2);
  check('FS-10', 'π d_m (mm)', PI * 6, 18.85); check('FS-10', 'μ l at 0.5', 0.5 * 32, 16); check('FS-10', 'μ l at 0.6', 0.6 * 32, 19.2);
}

/* ------------------------------------------------------------------ 04 */
{
  const I = 0.5 * 8 * 0.15 ** 2, N = 20 * 300 / 100, Tb = 0.35 * N * 0.15, a = Tb / I, w0 = rpm2rad(300);
  check('FB-1', 'I', I, 0.0900); check('FB-1', 'N', N, 60.0); check('FB-1', 'T_b', Tb, 3.15);
  check('FB-1', 't (s)', w0 / a, 0.898); check('FB-1', 'turns', w0 ** 2 / (2 * a) / (2 * PI), 2.24);
  check('FB-1', 'KE (J)', 0.5 * I * w0 ** 2, 44.4); check('FB-1', 'ΔT (°C)', 0.5 * I * w0 ** 2 / (8 * 452), 0.0123);
  const I2 = 8 * 0.15 ** 2, a2 = Tb / I2;
  check('FB-2', 'I', I2, 0.180); check('FB-2', 't', w0 / a2, 1.80); check('FB-2', 'turns', w0 ** 2 / (2 * a2) / (2 * PI), 4.49);
  check('FB-2', 'KE', 0.5 * I2 * w0 ** 2, 88.8);
  check('FB-3', 'N energizing a=20', 20 * 300 / (100 - 0.35 * 20), 64.5);
  check('FB-4', 'N other a=20', 20 * 300 / (100 + 0.35 * 20), 56.1);
  check('FB-5', 'x − μa (mm)', 100 - 0.35 * 300, -5);
  // FB-6 quadratic least squares
  const fr = [0, 120, 240, 360, 480, 600, 720], tu = [0, 2.3011, 4.2042, 5.7095, 6.8169, 7.5264, 7.8380];
  const t = fr.map(f => f / 240), th = tu.map(x => 2 * PI * x);
  const S = (f) => t.reduce((s, ti, k) => s + f(ti, th[k]), 0);
  const A = [[t.length, S(x => x), S(x => x * x)], [S(x => x), S(x => x * x), S(x => x ** 3)], [S(x => x * x), S(x => x ** 3), S(x => x ** 4)]];
  const b = [S((x, y) => y), S((x, y) => x * y), S((x, y) => x * x * y)];
  const sol = solve3(A, b);
  const mean = th.reduce((a, b) => a + b) / th.length;
  const ssr = t.reduce((s, ti, k) => s + (th[k] - (sol[0] + sol[1] * ti + sol[2] * ti * ti)) ** 2, 0);
  const sst = th.reduce((s, y) => s + (y - mean) ** 2, 0);
  check('FB-6', 'ω₀ (rad/s)', sol[1], 31.4); check('FB-6', 'α (rad/s²)', 2 * sol[2], -10.0);
  check('FB-6', 'R²', 1 - ssr / sst, 1.000);
  check('FB-7', 'T_b,meas', 0.09 * 10, 0.900); check('FB-7', 'μ_meas', 0.9 / (60 * 0.15), 0.100);
  check('FB-8', 'T_b,meas with coast', 0.09 * (10 - 0.5), 0.855);
  check('FB-9', 'ΔT (°C)', 3000 / (1 * 452), 6.64);
}
function solve3(A, b) {
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < 3; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[3] / r[i]);
}

/* ------------------------------------------------------------------ 05 */
{
  const mp = 1 / 0.3, Te = 0.3 * g * (0.5 + mp) * 2, P = Te * 0.3;
  check('CD-1', "m'_p (kg/m)", mp, 3.33); check('CD-1', 'throughput (/min)', 60 * 0.3 / 0.3, 60);
  check('CD-1', 'T_e (N)', Te, 22.6); check('CD-1', 'P (W)', P, 6.77); check('CD-1', 'motor power (W)', P * 1.5 / 1, 10.2);
  check('CD-1', 'T_p (N·m)', Te * 0.030, 0.677); check('CD-1', 'N_p (rpm)', 60 * 0.3 / (PI * 0.060), 95.5);
  const fr2 = 0.3 * g * (0.5 + mp) * 1, li2 = mp * g * 0.5;
  check('CD-2', 'T_e (N)', fr2 + li2, 27.6); check('CD-2', 'friction part (N)', fr2, 11.3);
  check('CD-2', 'lift part (N)', li2, 16.4); check('CD-2', 'backward pull (N)', li2, 16.4);
  const e3 = Math.exp(0.3 * PI), T2 = Te / (e3 - 1), T1 = Te + T2;
  check('CD-3', 'e^(μθ)', e3, 2.57); check('CD-3', 'T₂,min (N)', T2, 14.4); check('CD-3', 'T₁ (N)', T1, 37.0);
  check('CD-3', 'R (N)', Math.sqrt(T1 ** 2 + T2 ** 2 - 2 * T1 * T2 * Math.cos(PI)), 51.4);
  const th4 = deg(210), e4 = Math.exp(0.3 * th4), T24 = Te / (e4 - 1), T14 = Te + T24;
  check('CD-4', 'e^(μθ)', e4, 3.00); check('CD-4', 'T₂,min', T24, 11.3); check('CD-4', 'T₁', T14, 33.8);
  check('CD-4', 'R', Math.sqrt(T14 ** 2 + T24 ** 2 - 2 * T14 * T24 * Math.cos(th4)), 44.0);
  const m5 = motorOp({ Ts: 2, N0: 300, i: 3.14, eta: 0.9, TL: 0.68 });
  const v5 = m5.Nout * PI * 0.060 / 60;
  check('CD-5', 'pulley speed (rpm)', m5.Nout, 84.0); check('CD-5', 'belt speed (m/s)', v5, 0.264);
  check('CD-5', 'speed error (%)', (v5 - 0.3) / 0.3 * 100, -12.0);
  const s6 = ratioSolve({ Ts: 2, N0: 300, eta: 0.9, TL: 0.68, Nt: 95.5 });
  const m6 = motorOp({ Ts: 2, N0: 300, i: s6.hi, eta: 0.9, TL: 0.68 });
  check('CD-6', 'i_high', s6.hi, 2.70); check('CD-6', 'belt speed (m/s)', m6.Nout * PI * 0.060 / 60, 0.300);
  // CD-6 with exact linked values (T_L = T_p, target = N_p) rather than the rounded 0.68 / 95.5
  const s6x = ratioSolve({ Ts: 2, N0: 300, eta: 0.9, TL: Te * 0.03, Nt: 60 * 0.3 / (PI * 0.06) });
  check('CD-6', 'i_high with linked T_p, N_p', s6x.hi, 2.70);
  const M7 = 51.4 * 100 / 4, T7 = 677;
  check('CD-7', 'M (N·m)', M7 / 1000, 1.28); check('CD-7', 'τ_max (MPa)', trescaTmax(M7, T7, 8), 14.4);
  check('CD-7', 'n', 400 / (2 * trescaTmax(M7, T7, 8)), 13.8); check('CD-7', 'bearing load (N)', 51.4 / 2, 25.7);
}

/* ------------------------------------------------------------------ 06 */
{
  const lbf = 4.4482216152605;
  check('UF-1', 'ω (rad/s)', rpm2rad(300), 31.4); check('UF-1', 'T (N·m)', 500 / rpm2rad(300), 15.9);
  check('UF-2', 'd (mm)', cbrt(16 * 10 / (PI * 50e6)) * 1000, 10.06);
  check('UF-5', '1 hp (W)', 33000 * 0.3048 * lbf / 60, 745.70);
  check('UF-6', '85 N·cm (N·m)', 0.85, 0.85);
  check('UF-8', 'ΔT (°C)', 3000 / 452, 6.637);
  check('UF-9', '100 lbf·in (N·m)', 100 * lbf * 0.0254, 11.298);
  check('UF-10', 'exp(0.3π)', Math.exp(0.3 * PI), 2.57);
}

/* ------------------------------------------------------------------ 07 */
{
  const pct = (p, m) => (p - m) / m * 100;
  check('PL-1', 'pct', pct(3.8, 4.10), -7.32); check('PL-2', 'pct', pct(22, 22.56), -2.48); check('PL-3', 'pct', pct(95, 84.05), 13.0);
}

/* ------------------------------------------------------------------ 08 */
{
  const Tin = 0.5, ratio = 9, eta = 0.95 * 0.95;
  const Pin = Tin * rpm2rad(300), Tout = Tin * ratio * eta, Pout = Tout * rpm2rad(300 / 9);
  check('WB-1b', 'output rpm', 300 / 9, 33.3); check('WB-1b', 'ideal N·cm', Tin * ratio * 100, 450);
  check('WB-1b', 'with η N·cm', Tout * 100, 406); check('WB-1b', 'P in (W)', Pin, 15.7);
  check('WB-1b', 'P out (W)', Pout, 14.2); check('WB-1b', 'P lost (W)', Pin - Pout, 1.53); check('WB-1b', 'η overall %', eta * 100, 90.25);
  const w2 = motorOp({ Ts: 200, N0: 300, i: 44 / 14, eta: 0.9, TL: 68 });
  check('WB-2a', 'motor torque (N·cm)', w2.Tm, 24.0); check('WB-2a', '% stall', w2.pct, 12.0);
  check('WB-2a', 'motor rpm', w2.Nm, 264); check('WB-2a', 'output rpm', w2.Nout, 84.0);
  truth('WB-2b', 'stalled at 700 N·cm', motorOp({ Ts: 200, N0: 300, i: 44 / 14, eta: 0.9, TL: 700 }).stalled);
  check('WB-3a', 'a (mm)', 2 * (12 + 36) / 2, 48.0); check('WB-3b', 'a (mm)', 1 * (17 + 34) / 2, 25.5);
  const Ft = 2 * 0.5 / 0.024;
  check('WB-4a', 'F_t (N)', Ft, 41.7); check('WB-4a', 'F_r (N)', Ft * Math.tan(deg(20)), 15.2); check('WB-4a', 'resultant (N)', Ft / Math.cos(deg(20)), 44.3);
  check('WB-5a', 'T_L (N·cm)', 5 * g * 0.02 * 100, 98.1);
  const v5 = rpm2rad(100) * 0.02;
  check('WB-5b', 'v (m/s)', v5, 0.209); check('WB-5b', 'lift power (W)', 5 * g * v5, 10.3);
  check('WB-6b', 'overall ratio', 3 * 2, 6);
  check('WB-C4', 'ratio low', 300 / 99.75, 3.008); check('WB-C4', 'ratio high', 300 / 90.25, 3.324);
  check('WB-C5', 'band low', 95.5 * 0.95, 90.7); check('WB-C5', 'band high', 95.5 * 1.05, 100.3);
  check('WB-C7', '30% of 200 N·cm', 60, 60);
  const iC5 = ratioSolve({ Ts: 200, N0: 300, eta: 0.9, TL: 68, Nt: 95.5 });
  truth('WB-C5', 'solvable below 30% stall', motorOp({ Ts: 200, N0: 300, i: iC5.hi, eta: 0.9, TL: 68 }).pct < 30);
  // WB-C7 feasibility: lift 98.1 N·cm below 60 N·cm motor torque needs i·η ≥ 1.635 — note only
}

/* ------------------------------------------------------------------ 09 */
{
  const I = PI * 50 ** 4 / 64, A = PI * 50 ** 2 / 4, r = Math.sqrt(I / A);
  check('TV-1a', 'I (mm⁴)', I, 306796); check('TV-1a', 'r (mm)', r, 12.5); check('TV-1a', 'λ', 2000 / r, 160);
  check('TV-1a', 'P_cr (kN)', PI ** 2 * 200000 * I / 2000 ** 2 / 1000, 151.4);
  check('TV-1b', 'P_cr (kN)', PI ** 2 * 200000 * I / 4000 ** 2 / 1000, 37.8);
  check('TV-1c', 'λ_t', Math.sqrt(2 * PI ** 2 * 200000 / 250), 125.7);
  const s = 3.175, Is = s ** 4 / 12;
  check('TV-1d', 'I_min (mm⁴)', Is, 8.47); check('TV-1d', 'P_cr (N)', PI ** 2 * 3000 * Is / (2 * 25.4) ** 2, 97.2);
  const Ld = Math.hypot(3, 3) * 25.4, Pd = PI ** 2 * 3000 * Is / Ld ** 2, Fd = 100 / (2 * Math.sin(deg(45)));
  check('TV-1e', 'diagonal length (in)', Math.hypot(3, 3), 4.243); check('TV-1e', 'diagonal length (mm)', Ld, 107.8);
  check('TV-1e', 'diagonal force (N)', Fd, 70.7); check('TV-1e', 'P_cr (N)', Pd, 21.6);
  check('TV-1e', 'failure load (N)', 100 * Pd / Fd, 30.5);
  check('TV-2a', 'σ (MPa)', 2000 / 50, 40.0); check('TV-2b', 'area 1/8 in sq (mm²)', s * s, 10.08);
  check('TV-2b', 'σ (MPa)', 45 / (s * s), 4.46); check('TV-2c', 'strength (MPa)', 150 / (s * s), 14.9);
  check('TV-3b', 'σ rect (MPa)', 6 * 75000 / (20 * 40 ** 2), 14.1);
  check('TV-4a', 'span (mm)', 6 * 25.4, 152.4); check('TV-4b', '100 N (lbf)', 100 / 4.4482216152605, 22.5);
  check('TV-6', 'AD force (N)', Fd, 70.7); check('TV-6', 'AC force (N)', Fd * Math.cos(deg(45)), 50);
}

/* ------------------------------------------------------------------ report */
const bad = results.filter(r => !r.ok);
const fmt = v => typeof v === 'number' ? (Math.abs(v) >= 1e4 ? v.toFixed(0) : +v.toPrecision(5)) : String(v);
if (showAll) for (const r of results) console.log(`${r.ok ? 'ok  ' : 'DIFF'} ${r.id.padEnd(6)} ${r.what.padEnd(34)} computed ${fmt(r.got).toString().padEnd(10)} spec ${fmt(r.expected)}${r.note ? '  — ' + r.note : ''}`);
console.log(`\n${results.length} spec values checked, ${results.length - bad.length} agree, ${bad.length} differ.`);
for (const r of bad) console.log(`  DIFF ${r.id} ${r.what}: computed ${fmt(r.got)}, spec ${fmt(r.expected)}${r.note ? ' (' + r.note + ')' : ''}`);
process.exitCode = bad.length ? 1 : 0;
