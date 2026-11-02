# Plan: upgrades to the two existing tools (Phases 8 and 9)

`PLAN.md` lists Phase 8 (Gear Train Workbench, spec 08) and Phase 9 (Truss Stress Visualizer, spec 09) as upgrades to tools that students already use. This file is the detailed plan for Phase 8. Phase 9 gets its own section when it starts.

## 1. Phase 8: Gear Train Workbench upgrades

**Status (2026-11-02):** built and tested on the Workbench's `claude/festive-hawking-uxdha3` branch; waiting for review before `main`. See `STATUS.md`.

### 1.1 Starting point (read 2026-11-02)

- `GearTrainWorkbench/index.html`, 2161 lines, published from `main` with GitHub Pages and in use. No version number yet; this plan calls the published version 1 and the upgrade 2.0.0.
- Its own structure, not the ecosystem shell: a canvas sheet, a palette, an amber readout (DRO), "Show the working", a challenge panel with four tiers, per-challenge boards in `localStorage` (`gtw.boards.v1`), progress (`gtw.progress.v1`), save files (version 2, reads version 1), PNG export, a print report, light and dark themes, full keyboard operation.
- Two pure modules with tests: `dev/solver.js` (29 tests, inline copy checked by behaviour in `verify-html.js`, 14) and `dev/logic.js` (62 tests, inline copy checked as text and behaviour, 62). `dev/e2e.js` has 18 browser checks. All pass.
- Model today: gears only, fixed module (4.5 px per tooth of pitch diameter), meshes found by centre distance on the same plane, ideal (power in = power out), motor at a fixed speed and torque, a load that only measures.

### 1.2 Ground rules (spec 08 §0) and how they are met

- **Nothing changes for today's users with default settings.** A new **Advanced** switch in the palette (off by default) shows the new controls. With it off, the solver gets today's inputs and the page draws and reads exactly as today.
- **Regression proof, not only tests.** The published `index.html` is kept as `dev/fixtures/baseline-v1.html`. `dev/regress.js` runs the same scenarios in the old and the new page side by side in Chromium and compares the readout text, messages, "Show the working", the screen-reader description, challenge results, the report, file names, `localStorage`, and the canvas pixels. Scenarios: every challenge's reference solution with right and wrong predictions, sandbox trains (simple, idler, compound, branch, overlap, over-constrained loop, disconnected gear, no load), version 1 and version 2 save files, a refresh with saved boards and progress, and keyboard building.
- **Where the new features switch on.** In the sandbox, through Advanced. In the new challenge tier, from the challenge definition (motor mode, efficiencies, load), whatever the switch says. Turning Advanced off keeps the values but returns the sandbox to the ideal model (QUESTIONS Q37).
- **Branch.** Work goes on `claude/festive-hawking-uxdha3` in the GearTrainWorkbench repo, not `main`, because `main` is what students see. (`PLAN.md` named the branch `ebtn-upgrades`; the session's branch is used instead.)

### 1.3 Code structure

- `dev/solver.js` grows (efficiency on each stage, DC motor operating point, belt and chain stages, module mismatch, the new challenge pass conditions). The inline copy in `index.html` becomes a verbatim copy between markers, and `verify-html.js` checks the text as well as the behaviour.
- New pure module `dev/mech.js` with `dev/test-mech.js` and `dev/verify-mech.js`: gear geometry, tooth forces and their directions on the sheet, the shaft-loads export, the gear plate SVG, the spool load, part sizes for pulleys and sprockets, the predict-first targets, and the prediction-log records.
- `dev/logic.js` gets small backward-compatible additions (stages that include belts; board copy that keeps the new optional fields).
- Vendored from the ecosystem into `dev/vendor/` and inlined between `/* BEGIN vendor:… */` markers: `motor-core.js` (spec 02 §3.1–3.4, so the DC motor matches the Motor and Drive Matcher exactly), `prediction-log.js`, `schemas.js`. `vendor-manifest.json` gains a GearTrainWorkbench target, and `scripts/test-all.sh` runs the Workbench's suites.

### 1.4 Data (all fields optional, so old boards and files load unchanged)

- Gear: `module` (mm, default 1). Part kinds for item 6: `kind` (`gear` default, `pulley`, `timing`, `sprocket`), `dia` (mm) for flat pulleys.
- Board: `adv` = { `motorMode` (`fixed`|`dc`), `stall`, `noLoad`, `etaAll`, `eta` (by stage key), `pressureAngle` (20 or 14.5), `moduleNew`, `load` { `type` (`none`|`torque`|`spool`), `torque`, `spoolR`, `mass` } }, and `belts` [{ `id`, `a`, `b`, `crossed` }].
- Save file version 3 = version 2 plus `adv` and `belts`. Version 1 and 2 files load as before.
- New `localStorage` keys: `gtw.settings.v1` (Advanced, torque unit, Forces, Predict first) and `gtw.log.v1` (prediction log). Existing keys keep their shape.

### 1.5 Items and tests

| Item | What is built | Tests |
|---|---|---|
| 1. Mesh efficiency | η per stage (0.30–1.00), "same for every mesh"; torque along the power path × η; overall efficiency, power in, out and lost; a meshes list in the Advanced panel; η column in Show the working | WB-1a (regress), WB-1b |
| 2. Motor curve | Fixed or DC motor; stall torque and no-load speed; load torque on the Load; operating point with `MotorCore.operate`; "Stalled" with the reason; animation at the operating speed; an inset plot with the motor line, the point and the duty bands | WB-2a, WB-2b, WB-2c (regress) |
| 3. Geometry and plate | Module per gear, drawn to scale (4.5 px per mm, so module 1 is today's size); mesh only with equal modules, with the spec's message; d = zm, a = m(z₁ + z₂)/2; pressure angle 20° or 14.5°; gear plate SVG in mm with hole, crosshair, outline and margin, labels and a 10 mm scale bar on separate layers, cut colour and stroke width settable | WB-3a to WB-3d |
| 4. Forces and shaft loads | F_t = 2T/d on the driver's pitch diameter, F_r = F_t tan α, resultant; directions from the sheet (F_r along the line of centres pushing the gears apart, F_t along the driven gear's motion at the pitch point, equal and opposite on the driver); a Forces toggle with labelled arrows; the shaft-loads JSON with plane, shaft and torque; two-plane note past 5° | WB-4a, WB-4b, WB-4c (import into the real Shaft and Beam Workbench when it sits beside the repo) |
| 5. Spool | Load type Spool: radius and mass; T_L = mgr, v = ω_out r, P = mgv; the Fixed-mode flag; the DC-mode operating point; a rising mass drawn at the load shaft | WB-5a, WB-5b |
| 6. Belts and chains | Flat pulleys (by diameter), timing pulleys and sprockets (by teeth); a Belt tool joining two of the same kind on one plane; same direction, or reversed with a crossed belt; ratio by diameter or teeth; stages take part in the ratio, efficiency and working; no tooth forces | WB-6a to WB-6c |
| 7. Challenge pack | Tier 5, "Engineered by the Numbers", WB-C1 to WB-C9, with new pass conditions (ratio, exact mesh count, idler, motor % of stall, stalled, hidden η, exported plate) and new prediction kinds (η, motor torque, lift speed, F_t, F_r) | each challenge has a reference solution checked in Node and through the page |

Also in scope because the other tools expect it (QUESTIONS Q41):
- **Prediction log** (spec 07 Part A): a Log button with the table, Export CSV, Export JSON and Copy last row, as in the other tools. Records come from challenge runs (existing tiers too), sandbox predict first, and the new prediction kinds. Problem IDs `WB-1.1` … `WB-C9`, or `sandbox-<hash>`.
- **Predict first in the sandbox** (the mockup's header switch, off by default): the readout and the working stay hidden until the student checks a prediction for each current target (output speed and torque always; efficiency, power lost, motor torque and speed, lift speed, F_t and F_r, centre distance when those features are in use).
- **Torque unit**: N·cm in the readout as today, N·m as an option.
- **drive-request and drive-result** (ecosystem README): Load accepts a drive-request from the Conveyor Designer (sets the DC motor, load torque, stage efficiencies and shows the target speed) and a drive-result from the Motor and Drive Matcher. This is what the Conveyor Designer's "Build this in the Gear Train Workbench" button needs (QUESTIONS Q30).

### 1.6 Order of work

1. Baseline copy, `regress.js` against itself (old vs old) to prove the harness, then old vs new after each step.
2. Solver and `mech.js` for items 1–4 with WB-1 to WB-4 in Node.
3. Interface for items 1–4: Advanced panel, readout cells, inset plot, Forces, exports, Show the working, report, help and keys; predict first; the log.
4. Items 5–7: spool, belts and chains, tier 5.
5. drive-request and drive-result import.
6. e2e for every WB test through the page, regress, README, `docs/spec.md` §12, help, screenshots, STATUS, QUESTIONS.

### 1.7 Definition of done

- Spec 08 §8 acceptance: every existing challenge and saved file behaves identically with default settings (`regress.js`); all WB tests pass in Node and in the interface; new readouts appear in Show the working, predict first and the report; every new tool and setting works from the keyboard and is in the help key list.
- The Workbench's existing suites still pass, and `scripts/test-all.sh --e2e` runs them.
- Committed on `claude/festive-hawking-uxdha3` and pushed; `main` (what students use) changes only when the teacher merges.
