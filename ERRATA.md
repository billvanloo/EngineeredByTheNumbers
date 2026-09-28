# Spec errata

Disagreements between the spec test tables and an independent recompute, plus places where a test's expected value depends on a choice the spec leaves open. Spec values are never changed by the build. A real disagreement is implemented as the spec states, and the test is marked `disputed`.

Source of the recompute: `scripts/check-spec-values.js`, which uses only the spec formulas and no tool code. Run `node scripts/check-spec-values.js --all` to see every value.

## Result of the Phase 0 check (2026-09-27)

**222 numeric expected values across specs 01 to 09 were recomputed. All 222 agree within the `00 §10` tolerance.** No test is disputed.

Sixteen values sit between 0.2% and 0.5% from the recompute. All of them come from the spec rounding to 3 significant figures (for example, SB-6 τ = 10.13 → 10.1, and CD-1 motor power 10.15 → 10.2). The tools' tests compare unrounded core output against the spec value with the `00 §10` tolerance, so these pass without special handling.

## Notes on test interpretation (not errors)

These don't change any value. They record which reading of the spec the tests use, so that a result is reproducible.

| Test | Note | How the tests read it |
|---|---|---|
| MD-2 | "With i = 2.70 … T_m = 13.98% of stall." The exact root i_high = 2.7018 gives 13.98%. The rounded ratio 2.70 gives 13.99%. Both are within tolerance. | The test uses the exact root for the % stall, and the rounded ratio 2.70 for the N_out check. |
| SB-12 | "At 200 mm M = 50.0 N·m with T = 15.9 N·m." The torque segment starts exactly at 200 mm, so the result depends on whether the end station counts as carrying torque. | Torque segments include both end stations (closed interval). |
| SB-3 | \|M\|max = 5.00 N·m at support B is a hogging moment (M = −5.00 N·m in the sagging-positive convention of §3.2). | The readout shows the signed value and labels it hogging. \|M\|max compares magnitudes. |
| CD-5, CD-6 | These use the rounded load 0.68 N·m and target 95.5 rpm. The linked values from CD-1 are T_p = 0.6769 N·m and N_p = 95.49 rpm. Both give i_high = 2.70. | Linked values are used inside the Conveyor Designer. The test fixtures use the values in the table. |
| CD-7 | M = R·L_b/4 with R = 51.4 gives exactly 1.285 N·m, which rounds to either 1.28 or 1.29 depending on floating point. Using the unrounded R = 51.38 N gives 1.2845 → 1.28. | The tests chain unrounded values from CD-3. |
| TV-1d | Only E is given, not the strength S, so Euler versus Johnson can't be chosen from λ_t. P_cr = 97.2 N is the Euler value. | The test calls the Euler formula directly, and doesn't test the method choice. |
| PL-1 | PL-1 computes −7.32% from the displayed model value 4.10. In SB-6 the model's safety factor is 4.0975 before rounding. Spec 00 §3 says never round inside the calculation chain, so a live record holds `model: 4.0975` and `pctPredVsModel: −7.26`. The student's message shows "4.10 (−7.26% difference)". | Records store unrounded model values. The PL-1 test itself feeds in 4.10 and gets −7.32. |
| MD-1 | P_out = 0.68 N·m × 84.04 rpm × 2π/60 = 5.9845 W, which displays as **5.98 W** at 3 significant figures. The spec lists 5.99 W. The difference (0.09%) is well within tolerance. | Tests compare the unrounded value. The interface shows 5.98 W. |
| MD-2 | "With i = 2.70: N_out = 95.5 rpm." At the rounded ratio 2.70 the output is 95.56 rpm, which **displays as 95.6 rpm** (error +0.068% against the 95.5 target). 95.5 is the value at the exact root 2.7018. | Tests accept 95.56 against 95.5 (tolerance). The interface shows "2.70 → 95.6 rpm, error +0.0677%". |
