# Build plan: the remaining tools

Detailed plan for the five tools in `engineered-by-the-numbers-tool-specs/` that have no code yet. It expands the "Later phases" list in `PLAN.md` (Phases 4 to 7) and follows that file's Rules for the run and per-tool Definition of done. Nothing here changes a spec value.

Written 2026-11-01.

## 1. Where things stand

| Spec | Tool | Code today | Where |
|---|---|---|---|
| 00 | Shared conventions | Built as the shell | `ecosystem/shell/` (v1.1.0) |
| 01 | Shaft and Beam Workbench | Built, v1.0.0 | `billvanloo/ShaftBeamWorkbench`, core in `ecosystem/beam-core.js` |
| 02 | Motor and Drive Matcher | Built, v1.0.0 | `billvanloo/MotorDriveMatcher`, core in `ecosystem/motor-core.js` |
| 07 Part A | Prediction log record format | Built | `ecosystem/prediction-log.js` (PL-1 to PL-5, PL-7, PL-8, PL-6 at module level) |
| **03** | **Friction and Screw Lab** | **None** | Spec only |
| **04** | **Flywheel Brake Lab** | **None** | Spec only |
| **05** | **Conveyor Designer** | **None** (its motor and shaft models exist in the shared cores) | Spec only |
| **06** | **Units and Formula Checker** | **None** | Spec only |
| **07 Part B** | **Prediction Log Collector** | **None** (the parser and dedupe it needs exist) | Spec only |
| 08 | Gear Train Workbench upgrades | Existing tool, upgrades not started | `billvanloo/GearTrainWorkbench` |
| 09 | Truss Stress Visualizer upgrades | Existing tool, upgrades not started | `billvanloo/TrussStressVisualizer` |

Specs 08 and 09 extend tools that already have code, so they are outside this plan. They stay as Phases 8 and 9 in `PLAN.md`.

`scripts/check-spec-values.js` already recomputes the numeric expected values for FS, FB, CD, UF and PL (all agree). The rows it doesn't cover are behavior checks (messages, flags, round trips), which the tool tests below cover.

`STATUS.md` still says the repos are local only. ShaftBeamWorkbench, MotorDriveMatcher and EngineeredByTheNumbers are on GitHub now (pushed 2026-10-01), so the first step of Phase 4 updates `STATUS.md` to match.

## 2. Order and phases

| Phase | Work | Depends on | Relative size |
|---|---|---|---|
| 4.0 | Shared groundwork: shell v1.2, `stats.js`, `plot.js`, `anim.js` | nothing | M |
| 4a | Friction and Screw Lab (03) | 4.0 | M |
| 4b | Flywheel Brake Lab (04) | 4.0 | L |
| 5 | Conveyor Designer (05) | 4.0, beam-core, motor-core; ShaftBeamWorkbench and MotorDriveMatcher checked out for the round-trip e2e | XL |
| 6 | Units and Formula Checker (06) | 4.0 (shell only) | XL |
| 7 | Prediction Log Collector (07B) | 4.0, prediction-log; real logs from 03 to 06 as fixtures | M |
| Checkpoint C | Report, as in `PLAN.md` Checkpoint B | all of the above | |

- 4a and 4b are independent of each other and can run in parallel sessions once 4.0 is merged.
- Phase 6 needs nothing from 4a, 4b or 5 apart from the shell. It is the riskiest piece (a parser and a units engine), so it can start early in parallel.
- Phase 7 goes last because it is most useful when it is tested against real logs written by every other tool.
- The spec README's suggested order puts 09 between 05 and 06. That only matters if Phase 9 is done in the same goal, and nothing here depends on it.

**Checkpoints.** Stop for review after 4.0 (shell changes touch the two published tools), after 4a and 4b (Checkpoint "C1"), after 5 and 6 ("C2"), and after 7 (Checkpoint C). Each stop reports what `PLAN.md` Checkpoint B lists.

## 3. Before starting

1. **Workspace.** `scripts/sync-vendor.js` and `scripts/test-all.sh` expect the tool repos as siblings of this one. Clone `ShaftBeamWorkbench` and `MotorDriveMatcher` next to `EngineeredByTheNumbers`. New repos go in the same folder.
2. **Playwright.** `npm i --no-save playwright@1.63.0` in each repo root, as in Phases 2 and 3. The e2e kit already falls back to a cached Chromium.
3. **Baseline.** Run `scripts/test-all.sh --e2e` and record the counts in `STATUS.md` before changing the shell.
4. **Repos.** New repos are `FrictionScrewLab`, `FlywheelBrakeLab`, `ConveyorDesigner`, `UnitsFormulaChecker` and `PredictionLogCollector`, made by copying `ecosystem/shell/demo/` (ecosystem README, "Starting a new tool"). Creating them on GitHub and pushing waits for approval at each checkpoint, as in `PLAN.md` rule 4.
5. **Questions first.** Add Q11 to Q30 from section 10 of this plan to `QUESTIONS.md` at the start, with the default each build uses, so the teacher can answer them while the build runs.

## 4. Phase 4.0: shared groundwork

Every remaining mockup needs things the shell doesn't have yet: header tabs, animation, a hold-to-act control, plots, statistics and challenge lists. Building them once here keeps the five tools consistent and keeps tool code small.

### 4.1 Shell v1.2 (`ecosystem/shell/shell.js`, `shell.css`)

All additions are opt-in config keys, so ShaftBeamWorkbench, MotorDriveMatcher and the demo keep working unchanged. After the change, run `scripts/sync-vendor.js` and the full e2e suite for both published tools before anything else.

| Addition | Why | Notes |
|---|---|---|
| `cfg.tabs` | All five mockups show header tabs (Ramp + Screw / Challenge; Model / Data / Compare; Requirements / Design / Design record; Worksheet / Convert / Formula library; Summary / Records / Students) | `{ options: [{id, label}], get(app), set(app, id) }`. Renders a `role="tablist"` with arrow-key movement, `aria-selected` and `aria-controls`. Tabs and the existing `cfg.modes` can coexist. The current tab is saved with state. |
| Challenge lists | 03 has a teacher-set "mystery surface"; 00 §4.6 lets a teacher require a prediction before Run | `cfg.challenges` hook: the teacher pastes a challenge list (JSON) into Settings, as Q6 did for motors. The shell validates it, stores it, offers a picker in Challenge mode, and passes the active challenge to `problemId()`. A challenge can hide input values (shown as "hidden"), set tolerance bands (00 §4.5) and set `requirePrediction`. |
| `app.gate(actionName)` | 00 §4.6: Run, Spin up, Turn and similar buttons must be blockable until a prediction is checked | Returns false and shows "Check your prediction first." when the active challenge requires it. |
| Grouped working | 05 needs a working panel per design section; 04 needs separate model and data working | `app.setWorking(steps)` also accepts `[{ heading, steps }]`. The report prints each group under its heading. |
| Grouped predict targets | 05 has predict targets per section | `predictTargets` items take an optional `group`. One Check per group, so a team can predict belt pull before they see power. |
| `cfg.predictFirst: false`, `cfg.nameField: false` | The Collector is a teacher tool. Predicting and a student name make no sense there | Hides the Predict first switch, the Name field and the log dialog. |
| Multi-file Load and drop | 07 loads many files at once; 04 accepts CSV data | `cfg.acceptMultiple` and `cfg.onFiles(app, [{name, text}])`. The page-level drop zone already exists for single files. |
| `app.announce(text)` | 06 must announce each line result and flag | Exposes the existing polite live region for tool use. |

Tests: new unit checks in `ecosystem/test/test-shell-util.js` for any pure helpers, and new demo e2e checks for tabs (keyboard), a challenge with `requirePrediction`, grouped working in the report and the `predictFirst: false` header.

### 4.2 New shared modules

| File | Contents | Used by | Tests |
|---|---|---|---|
| `ecosystem/stats.js` | `mean`, `median`, `stdDev(xs, {sample})`, `min`/`max`, `quantile`, `polyfit2(ts, ys)` (least-squares quadratic, solved by normal equations on centered t for conditioning), `rSquared`, `residuals` | 03 (measured μ statistics), 04 (θ(t) fit), 07 (medians, shares) | FB-6 fit to the spec values; FS-3 mean; hand-checked medians with odd and even counts; an exact parabola gives R² = 1 |
| `ecosystem/plot.js` | Nice tick steps, linear scales, SVG axis and grid, point, line and dashed-reference helpers, all drawing with `app.pal()` colours and a caller-supplied ID prefix (the `clipPath` lesson from Phase 2) | 03 dot plot, 04 fit and residual plots, 05 none, 07 scatter | Tick generation for awkward ranges (0 to 0.37, −12 to 31.4); output contains no NaN |
| `ecosystem/anim.js` | One `requestAnimationFrame` loop per tool with: pause when the tab is hidden, a time scale (04 needs 1×, ¼ and 1/10), reduced-motion handling (00 §7: stop motion, keep numbers live), and an injectable clock so e2e can step time exactly | 03 block and screw, 04 wheel, 05 boxes | Unit tests with a fake clock; the 04 acceptance check ("stop time within one frame") uses the injected clock |
| `ecosystem/hold.js` | Press-and-hold behaviour shared by a button and a key (03 Turn and arrow keys, 04 hold B): pointer capture, key repeat ignored, release on blur | 03, 04 | Small DOM e2e in the demo |

`plot.js` repeats some axis code from MotorDriveMatcher's torque-speed plot. MotorDriveMatcher can adopt it later; this plan doesn't change that tool beyond the shell sync.

Add the new files to `vendor-manifest.json` per tool, and to `ecosystem/README.md`'s file table.

### 4.3 Conventions to fix before the tools

- **Quantity strings.** The Collector groups records by `quantity` text, so each tool's predict targets use fixed names. They are listed per tool below and also go into `ecosystem/schemas.md` as a "Prediction quantities" table.
- **Challenge IDs.** `<tool prefix>-<number>`, using the spec test prefixes: `FS-`, `FB-`, `CD-`, `UF-`. Sandbox stays `sandbox-<hash>`.
- **Module tags.** A tool-to-module table in `schemas.md` (from the spec README) that the Collector uses for its Module filter (Q27).

## 5. Phase 4a: Friction and Screw Lab (spec 03)

Repo `FrictionScrewLab`. Vendors `prediction-log.js`, `schemas.js`, shell, `stats.js`, `plot.js`, `anim.js`, `hold.js`, tooling.

### 5.1 Core (`dev/core.js`, plain SI in and out)

| Function | Spec | Returns |
|---|---|---|
| `ramp({theta, m, muS, muK, sliding})` | 3.1 | weight components, N, `slides` (tan θ > μ_s), `a = g(sin θ − μ_k cos θ)` clamped at 0 for a block that would stop, slip angle `atan(μ_s)` |
| `muFromAngles(degList)` | 3.1 measure | each μ = tan θ, mean, min, max, standard deviation (Q12), count; rejects more than 20 trials |
| `geometry({d, p, n, form, dmOverride, drOverride})` | 3.2 | l, d_m, d_r, λ, α (0°, 14.5°, 15°) |
| `screw({W, d, p, n, form, mu, muC, dC, R, ...})` | 3.2 to 3.4 | μ′, φ = atan μ′, T_R screw / collar / total, T_L screw / collar / total, `raiseDefined`, `overhauls`, F, F_ideal, e, `selfLockingThread` (π μ′ d_m > l), `holdsWithCollar` (T_L total ≥ 0), σ, τ, tan-sum check value for square threads |
| `backCalcMu({..., Fmeas})` | 3.5 | μ by bisection on [0, min(1, μ_singular − ε)], where μ_singular is where π d_m − μ′ l = 0; measured e; `noFit` with a reason when F_meas is below the frictionless force or above the reachable range |
| `validate(inputs)` | 00 §8, FS-11 | field messages, including "Pitch must be smaller than the diameter." |

Edge rules: "cannot be turned" when π d_m − μ′ l ≤ 0 (FS-10); never return NaN (the shell shows reasons instead).

### 5.2 Tests (`dev/test.js`)

FS-1 to FS-12, one block per row, compared with the `00 §10` tolerance. FS-8 checks both statements. FS-10 checks the defined case and the undefined case. FS-11 is a `validate` check. FS-12 is a UI check (send μ to Screw) plus a core check that the value is unchanged. Add the prediction-record tests for each predict target, as in Phases 2 and 3.

### 5.3 Interface (mockup 03: inputs left, Ramp and Screw jack centre, Results right)

- **Tabs:** "Ramp + Screw" and "Challenge" (shell `cfg.tabs` plus a challenge picker).
- **Ramp drawing:** draggable angle handle (pointer and arrow keys, 0.1° steps with Shift for 1°), block, force arrows labelled with values (mg, components, N, friction). Simulate mode animates the slide with `anim.js` at the computed a; measure mode shows the dot plot (`plot.js`) of each μ with the mean line and spread.
- **"Send μ to Screw":** copies the mean, sets the Screw μ field, and labels it "from Ramp measurements" (FS-12). Editing the field by hand removes the label.
- **Screw jack drawing:** thread profile redrawn per form, load block, handle. Turn button and arrow up raise, arrow down lowers, Let go releases (`hold.js`). On release, hold if T_L total ≥ 0, otherwise drop with increasing speed (Q11). The drop rule is the acceptance check.
- **Unrolled-thread triangle:** true angle with a zoom control (1×, 2×, 5×, 10×) and a "zoomed" label; λ solid, φ dashed.
- **Readouts:** every output in spec §6, with "self-locking by thread" and "holds with collar" as separate rows with text labels, not colour alone.
- **Show the working:** l, d_m, d_r, λ, μ′, φ, T_R with numbers, the tan(φ + λ) line for square threads, collar torque, T_L, e, F, F_ideal, σ, τ, and the back-calculation when F_meas is set. Sources per 03 §9.
- **Measured F:** shows back-calculated μ and measured e beside the predictions and calls `app.recordMeasured('handle force F', Fmeas)`.

### 5.4 Predict targets

| Quantity string | Unit |
|---|---|
| `friction coefficient mu` (from a given slip angle) | |
| `torque to raise T_R` | N·m |
| `handle force F` | N |
| `efficiency e` | % |
| `self-locking` | yes/no, logged as 1 or 0 (Q13) |

### 5.5 Extra e2e checks (beyond `kit.standard`)

FS-3 typed into measure mode; FS-4 and FS-6 readouts through the interface; release behaviour for FS-4 (holds), FS-6 (drops) and FS-8 (holds by collar); FS-10 message; FS-11 field message; FS-12 label; keyboard-only raise, lower and release; triangle zoom by keyboard.

## 6. Phase 4b: Flywheel Brake Lab (spec 04)

Repo `FlywheelBrakeLab`. Vendors the same set as 4a.

### 6.1 Core

| Function | Spec | Returns |
|---|---|---|
| `inertia({type, parts, customI})` | 3.1 | I for disk, hoop, disk + hoop (separate mass and radius per part), custom |
| `lever({P, l, x, a, mu, direction})` | 3.2 | N, F = μN, `selfLocking` when x − μa ≤ 0 in the energizing direction (no N then), self-energizing factor x/(x ∓ μa) |
| `stop({I, Tb, Td, N0})` | 3.3 | α, t, θ, turns, KE, brake share and drag share of the energy; `noStop` when T_b + T_d = 0 (FB-12) |
| `heat({KE, mPart, c})` | 3.5 | ΔT upper limit |
| `parseData(text, format, fps)` | 3.4 | rows as (t, θ) for the three formats; errors for missing fps (FB-11), non-numeric rows and non-increasing time |
| `fit(rows, window)` | 3.4 | ω₀, α, R², residuals via `stats.polyfit2`; fewer than 3 points gives "Add at least three data points to fit a curve." (FB-10) |
| `measured({I, alphaBrake, alphaCoast, N, r})` | 3.4 | T_b,meas = I(\|α_brake\| − \|α_coast\|), μ_meas = T_b,meas / (N r) |
| `angleAt(t)`, `speedAt(t)` | 3.3 | for the animation and the energy bar |

### 6.2 Tests

FB-1 to FB-12. FB-6 uses the frame-count fixture from the spec exactly. FB-7 and FB-8 chain from FB-6. FB-5 checks that no N value is returned and the self-locking explanation is present. Add a fit test for each of the other two data formats, converted from the FB-6 data.

### 6.3 Interface (mockup 04: inputs left, wheel and data fit centre, Results and Compare right)

- **Tabs:** Model, Data, Compare.
- **Model:** lever drawing with pivot O, dimensions l, x and a, the shoe, and labelled N and μN arrows; the wheel animates at true speed with ¼ and 1/10 slow-motion buttons and an elapsed-time readout. Spin up, Apply brake (hold B), Reset. The pad colour deepens with absorbed energy, with a text percentage beside it (colour is never the only signal). Energy bar split brake : drag.
- **Data:** paste box and CSV upload, format picker, fps field, a "This run is brake off (coast-down)" checkbox, a list of runs. Fit plot with data points, curve and derived ω(t), plus a residual plot. The time window is set by dragging two handles on the plot or by keyboard (focus a handle, arrows move it by one data point). "Use coast-down as bearing drag" fills T_d = I·\|α_coast\| (3.3 says T_d can come from a coast-down fit).
- **Compare:** predicted versus measured stopping time, T_b and μ, with percent differences. Measured values go into the log with `app.recordMeasured`.
- **Help:** includes the one-page student guide to counting frames in phone slow-motion video (acceptance item). Draft it from the unit plan's lab notes, and mark anything not in the specs for teacher review.

### 6.4 Predict targets

`normal force N` (N), `braking torque T_b` (N·m), `stopping time t` (s), `turns to stop` (turns), `temperature rise upper limit` (°C).

### 6.5 Extra e2e checks

FB-1 to FB-5 through the interface; FB-6 pasted and fitted; FB-10 and FB-11 messages; FB-12 shows the message and no infinite time; the animated stop time matches t within one frame at 1× (injected clock); the fit window moves by keyboard; reduced motion stops the wheel but keeps the readouts.

## 7. Phase 5: Conveyor Designer (spec 05)

Repo `ConveyorDesigner`. Vendors `beam-core.js` and `motor-core.js` unchanged (spec 05 §9: identical results to 01 and 02), plus the 4a set minus `hold.js`.

### 7.1 Core

The tool's own core is only the conveyor math. Motor, ratio and shaft calls go through the vendored cores.

| Function | Spec | Returns |
|---|---|---|
| `load({mBox, s, v, L})` | 3.1 | m′_p, throughput, boxes on belt (a range when s doesn't divide L) |
| `beltPull({mu, mb, mp, L, H})` | 3.2 | T_e with friction and lift parts, incline angle |
| `power({Te, v, SF, eta})` | 3.3 | P, motor power needed |
| `pulley({Te, v, D})` | 3.4 | T_p, N_p |
| `drive({Tp, Np, motor, ratio, eta})` | 3.5 | wraps `MotorCore.operate` and `MotorCore.solveRatio`: operating point, loaded pulley speed, belt speed, speed error, duty band, both roots |
| `tensions({Te, muP, wrapDeg, T2})` | 3.6 | e^(μθ), T₂,min, default T₂ = 1.3 T₂,min, T₁, slip margin, `slips` |
| `sideLoad({T1, T2, wrapDeg})` | 3.7 | R, its direction (Q22), bearing loads |
| `shaft({R, Lb, Tp, d, Sy})` | 3.7 | builds a centered single-load beam and calls `BeamCore.analyze` for M, τ_max and n (Tresca) |
| `holdOnIncline({mp, H})` | 3.8 | flag and backward pull m′_p g H |
| `requirements(rows, outputs)` | §4 | pass, fail or manual per row |
| `design(inputs)` | all | runs the chain in order and returns every output, so the interface and the design record read one object |

### 7.2 Requirements sheet

Each row: ID, description, quantity type (§4 list), comparison, target, tolerance, unit, linked output, status. The spec gives target and tolerance only. The mockup also shows "≥ 55/min" and "≤ 30% of stall", so rows take a comparison of "target ± tolerance", "at least" or "at most" (Q21). Custom rows are always "manual". The Design tab shows "no requirements yet" until there is at least one row, but stays usable (§6.1).

### 7.3 Tests

CD-1 to CD-10. CD-5 and CD-6 use the table values (0.68 N·m, 95.5 rpm) as ERRATA notes, and a second test checks the linked values. CD-7 chains unrounded values from CD-3 (ERRATA). CD-8 and CD-9 are validation and status checks.

**Shared fixtures.** Add `ecosystem/test/fixtures/conveyor-shared.json` with the CD-3, CD-5, CD-6 and CD-7 inputs. Three tests read it: `ecosystem/test/test-motor-core.js` and `test-beam-core.js` call the cores directly, and `ConveyorDesigner/dev/test.js` calls the conveyor core. All three must give identical numbers (not just within tolerance). This meets the §9 acceptance item.

### 7.4 Interface (mockup 05: Requirements and Inputs left, side view centre, Design results right)

- **Tabs:** Requirements, Design, Design record.
- **Side view:** belt, boxes moving at v to scale (`anim.js`), tail and drive pulleys, motor block, incline at arcsin(H/L), T₁ and T₂ arrows with values, the side load arrow, a "belt will slip" marker on the drive pulley when the slip margin is below 1 (CD-9), and the incline hold flag.
- **Step strip:** Requirements → Belt pull → Power → Pulley → Motor and ratio → Tensions → Shaft → Bearings, each a collapsible section with its own predict targets and working group (shell grouped predict and working).
- **Ratio:** solver result by default, or a hand-entered ratio with the resulting belt speed and its error.
- **Exports:** design record (the report: requirements table first, then each section's working, then sources, letter paper, every number with a unit), shaft-loads JSON, drive-request JSON, prediction log. **Imports:** drive-result JSON from the Motor and Drive Matcher (sets motor and ratio), and later from the Gear Train Workbench once spec 08 is built.
- **"Build this in the Gear Train Workbench"** exports the drive-request now. The Workbench can't read it until Phase 8, so the help panel says to use the Motor and Drive Matcher until then.

### 7.5 Predict targets

`belt pull T_e` (N), `belt power P` (W), `pulley speed N_p` (rpm), `minimum slack-side tension T2_min` (N), `shaft side load R` (N), `shaft safety factor n`, each in its own section group.

### 7.6 Extra e2e checks

CD-1 to CD-9 through the interface. **CD-10 across repos:** export shaft-loads from CD-3, load it into the sibling `ShaftBeamWorkbench/index.html` in the same Playwright run, place it at the centre of a 100 mm span with d = 8 mm and Sy = 400 MPa, and compare the readouts with CD-7. Also export a drive-request, load it into `MotorDriveMatcher`, export the drive-result and load it back. Both cross-repo checks skip with a clear message when the sibling repo isn't checked out, so the repo still tests alone. The design record prints on letter size (Playwright `page.pdf({ format: 'Letter' })`) with the requirements table on page 1.

## 8. Phase 6: Units and Formula Checker (spec 06)

Repo `UnitsFormulaChecker`. Vendors `prediction-log.js`, `schemas.js`, shell and tooling. This tool is mostly a language implementation, so the core is split into modules that are tested separately, then joined into one `dev/core.js` for the inline block.

### 8.1 Core parts

1. **Units table** (`units`): every unit in §3.2 with its factor to SI and dimension vector [M, L, T, Θ, I], plus tags: angle kind (rad, deg, rev), quantity kind (torque, energy, ...), temperature (absolute or difference) and percent. Constants come only from §3.3 (acceptance: "every conversion constant traces to section 3.3"). A test checks that the help text lists every constant in the table.
2. **Quantity type:** `{ value (SI), dim, angle, kind, display, origin }`. Arithmetic rules for +, −, ×, ÷, integer and rational powers. `sqrt` and `cbrt` require exponents divisible by 2 or 3, otherwise a flag.
3. **Lexer and parser** (Pratt parser) for the line forms in §3.4: given, computed step, target check (`T in N·m`) and bare conversion (`1 hp in W`). Rules for the ambiguities:
   - A unit is read only straight after a number literal (or after `in` in a target). Elsewhere an identifier is a variable or constant. So `N = 300 rpm` defines a variable N, `5 N` is newtons, `m = 1 kg` and `m*c` are variables, and `g` alone is 9.81 m/s² (with a note), while `5 g` is grams.
   - A unit expression after a number may use `*`, `/`, `^`, `·`, a space and parentheses: `452 J/(kg·°C)`.
   - The target keyword is the last ` in ` that is followed by a complete unit expression to the end of the line. `100 lbf·in in N·m` converts lbf·in, and `25 in` is 25 inches.
   - `%` after a number is a percent quantity.
   - Greek names (omega, tau, ...) and `dT`/`deltaT` display as symbols. Variables are case sensitive.
4. **Evaluator:** runs lines top to bottom, keeps a symbol table, records each line's value, dimensions, display unit and flags. A line that depends on a flagged "no value" line shows "no value" with the reason.
5. **Detectors** (§3.5), each a small function with its own tests:
   - Add or subtract mismatch (UF-3).
   - Function argument (UF-4).
   - Degrees in a radian formula: the value is converted, and a note is shown (UF-10).
   - rpm used as rad/s (UF-1): a quantity with the rev angle tag multiplied or divided with power, torque or a length. The fix inserts `omega = 2*pi*N/60` above the line and rewrites the line to use `omega` (the mockup's line 3′). The pattern `2*pi*N/60` (and `N*2*pi/60`, `pi*N/30`) with N in rpm is read as the conventional rpm-to-rad/s conversion so ω comes out as 31.4 rad/s (Q24).
   - Mixed length prefixes in stress: a note only, since everything is SI inside.
   - Target unit mismatch.
   - Absolute temperature in Q = mcΔT (Q25).
   - Percent: shows the note and uses the fraction (UF-14).
   - Kind mismatch: torque plus energy (UF-11). A line's kind comes from its unit by default (N·m is torque, J is energy) and can be changed per line.
6. **Rearrange helper** (§3.7): counts the unknown in the formula's tree. If it appears more than once, decline with the spec's message (UF-13). Otherwise undo operations from the outside in and record each step (UF-12 gives d = ∛(16T/(πτ))). Handles +, −, ×, ÷, powers, sqrt and cbrt; anything else declines.
7. **Formula library:** the 18 equations in §3.6, each with variables, units and the source from the unit plan.

### 8.2 Tests

UF-1 to UF-14, plus parser tests for every ambiguity rule above, a units-table test against §3.3, round trips for each unit family, and a 30-line worksheet timing check in Node (the browser check is in e2e).

### 8.3 Interface (mockup 06: Formula library left, Worksheet centre, flag and Convert panel right)

- **Tabs:** Worksheet, Convert, Formula library.
- **Worksheet:** one row per line with a line number, the text, a value in its display unit, a compatible-units dropdown, a kind dropdown, and a check mark or flag. Enter evaluates and moves to a new line. Clicking a flag (or Enter on it) opens the explanation with **Apply fix**. Each result and flag is announced (`app.announce`).
- **Convert:** quick conversions, plus a "Dimensions of line n" readout.
- **Library:** Insert and Rearrange.
- **Exports:** text (copyable), PNG of the worksheet, report. Save and Load the worksheet as a design file.
- **Drawing for the shell:** the worksheet rendered as SVG for PNG export and the report.

### 8.4 Predict targets

Spec 06 lists none, but 00 §4 says every tool has predict-first. Default (Q23): with Predict first on, computed lines hide their value until the student types a prediction for that line and presses Check. The quantity string is the line's variable name and unit, and the problem ID is a hash of the givens.

### 8.5 Extra e2e checks

UF-1 typed in, flagged, fixed and re-evaluated to 31.4 rad/s and 15.9 N·m; UF-12 rearrange shown; units dropdown lists only compatible units; 30 lines recalculate in under 50 ms (measured and recorded); live region text after each line; keyboard-only flag and fix.

## 9. Phase 7: Prediction Log Collector (spec 07 Part B)

Repo `PredictionLogCollector`. Vendors `prediction-log.js`, shell (with `predictFirst: false` and `nameField: false`), `stats.js`, `plot.js` and tooling.

### 9.1 Core

| Function | Spec | Notes |
|---|---|---|
| `loadFiles([{name, text}])` | 4.1.1–2 | `PredictionLog.parseFile` per file; collects per-file failures with reasons (PL-8) and newer-version warnings (PL-7); merges; `dedupe` and reports the count removed (PL-6) |
| `normalizeSheetsCSV` | PL-11 | accept no BOM, LF line ends, trailing empty columns, and timestamps that Sheets reformats; keep `inputs` JSON intact |
| `filter(records, f)` | 4.1.3 | module (via the tool-to-module table, Q27), tool, problem, quantity, student, team, class period, date range |
| `problemSummary(records)` | 4.1.4 | per problem and quantity: students, first-attempt median \|%\|, share within 5% on first attempt, median attempts to reach within 5% (PL-9) |
| `studentSummary(records)` | 4.1.4 | per student: problems attempted, first-attempt median \|%\|, trend over time (first attempts in date order) |
| `measuredVsModel(records)` | 4.1.4 | points of pctMeasVsModel grouped by problem |
| `exportCSV(records)` | 4.1.5 | `PredictionLog.toCSV` |

Medians, not means, everywhere (acceptance item), with the reason in help.

Dedupe uses the timestamp, so a record that Sheets re-saves with a reformatted timestamp would no longer match its original. `normalizeSheetsCSV` turns timestamps back into ISO form before the dedupe, and the PL-11 test loads the original and the re-saved file together to check that.

### 9.2 Tests

PL-6 to PL-11 (PL-1 to PL-5 are already covered in `ecosystem/`). PL-10 uses a seeded generator for 500 files and 20,000 records, timed in Node and in e2e (target under 3 s on a Chromebook; record the build-machine number and note that a real Chromebook still needs a manual check, as in Phases 2 and 3). PL-11 uses two fixtures: a CSV written the way Google Sheets re-exports it, and, if possible, one produced by a real Sheets round trip of a Phase 4 log (Q29).

### 9.3 Interface (mockup 07: Files and Filters left, summaries centre, Record format right)

- **Tabs:** Summary, Records, Students.
- **Files:** drop zone and picker for many files, a status line (files loaded, duplicates removed, failures with reasons), a privacy banner ("Nothing leaves this browser."), and Clear loaded data.
- **Summary:** problem table and the measured-versus-model scatter (`plot.js`, with labelled groups and a 0% reference line).
- **Records:** sortable table with keyboard-sortable headers, virtualised past about 2,000 rows so PL-10 stays fast.
- **Students:** per-student table with a small trend line each.
- **Exports:** merged CSV and a printable summary (the shell report).
- Loaded class data is held in memory only by default (Q28).

### 9.4 Extra e2e checks

Load several fixture files including a malformed one and a version-2 one; load the same file twice; filters narrow every view; sort by each column with the keyboard; export merged CSV and reload it with no change; PL-10 timing; Clear loaded data empties the page.

## 10. Open questions to add to `QUESTIONS.md`

Each has the default the build uses, so nothing is blocked.

| # | Where | Question | Default for the build |
|---|---|---|---|
| Q11 | 03 §5.3 | How fast should an overhauling load drop? The spec gives no inertia or drag for the screw. | Show a qualitative drop that speeds up, and say in help that the speed is for show and only "drops or holds" is computed. |
| Q12 | 03 §3.1 | Standard deviation of measured μ: sample (n − 1) or population? | Sample (n − 1), labelled "sample standard deviation". |
| Q13 | 03 §6 | "Self-locking yes or no" is a predict target, but the log's `predicted` is a number. | Log 1 for yes and 0 for no with unit `yes/no`, and a match only when equal. |
| Q14 | 03 §3.5 | Should the back-calculation include collar friction (solve for thread μ with μ_c fixed)? | Yes: T_R,total(μ) = F_meas·R with μ_c held. Same as the spec when μ_c = 0 (FS-9). |
| Q15 | 03 §4 | Which challenges ship? Only "mystery surface" is named. | Ship one example mystery-surface challenge and the challenge-list format, marked as an example for the teacher to replace. |
| Q16 | 04 §3.2 | With a negative offset a, "Energizing" no longer describes the physics. Should direction be clockwise or counterclockwise instead, with energizing worked out from the sign of a? | Implement the spec formulas as written with signed a, and show the self-energizing factor so the effect is visible. |
| Q17 | 04 §3.5 | Specific heat presets other than steel are "teacher-entered placeholders". Which ones? | Steel 452 (OpenStax) plus "Placeholder aluminum" and "Placeholder brass", flagged as placeholders. |
| Q18 | 04 §8 | The frame-counting student guide has no source text in the specs. | Draft it and mark it for teacher review. |
| Q19 | 05 §4 | "Motor power margin: available motor power at operating point" — at an operating point the motor delivers exactly what the load takes. Is "available" the motor's maximum power, T_s·ω₀/4? | Use maximum power T_s·ω₀/4 ÷ required motor power, and label the formula. **Needs review.** |
| Q20 | 05 CD-5 | One drive efficiency η is used for both "motor power needed" and the gearbox stage efficiency. Is that intended? | Yes, one field, as CD-5 does. |
| Q21 | 05 §4 | Requirement rows need a comparison (at least, at most, target ± tolerance); the spec gives only target and tolerance. | Add the comparison column, as the mockup implies. |
| Q22 | 05 §3.7 | Direction of the side load in the shaft-loads export. `schemas.md` shows 270° (down), but for 180° wrap both spans pull toward the tail. | Compute the direction from the span geometry (the bisector of the two spans) and note it in help. The Shaft and Beam Workbench result doesn't depend on it for one load. |
| Q23 | 06 | No predict-first targets are listed. | Computed lines are the targets (section 8.4 above). |
| Q24 | 06 §3.5 | `omega = 2*pi*N/60` with N in rpm is a numeric-value equation. Read strictly in SI, it gives the wrong value. | Recognise the rpm conversion pattern and use N's number in rpm, with a note. |
| Q25 | 06 §3.5 | How does the tool know a °C value is absolute or a difference? | Typed °C values are absolute unless the name starts with d, Δ or delta, or the value is a difference of two temperatures. °C inside compound units (J/(kg·°C)) is a difference. |
| Q26 | 07 §4 | The Collector mockup shows Predict first and Name in the header. | Hide both (teacher tool). |
| Q27 | 07 §4.1 | Records have no module field. Several tools serve more than one module. | Map tool to modules from the spec README, and narrow by challenge prefix when present. **Teacher may prefer a `module` field in schema version 2.** |
| Q28 | 07 §4.2 | Should loaded class data persist in local storage? | No. Memory only, cleared on reload, with a note in help. |
| Q29 | 07 PL-11 | A real Google Sheets round trip needs a Google account. | Use a synthetic Sheets-style fixture, and ask the teacher for one real re-saved file. |
| Q30 | 05 §3.5 | "Build this in the Gear Train Workbench" can't work until spec 08 is built. | Export the drive-request now and point to the Motor and Drive Matcher in help until Phase 8. |

## 11. Risks

| Risk | Effect | Mitigation |
|---|---|---|
| Shell v1.2 changes break the two published tools | Regressions in tools already in use | Opt-in config only; run both tools' full e2e after the sync; stop at the 4.0 checkpoint |
| The units parser in 06 grows past the spec | Schedule | Hold to §3 and the ambiguity rules above; anything else gets "This one needs algebra the helper does not do yet" or a QUESTIONS entry |
| Animation timing tests are flaky in headless Chromium | False failures | Injected clock in `anim.js`; e2e steps time instead of waiting |
| CD-10 depends on another repo | The Conveyor Designer can't be tested alone | Cross-repo checks skip with a clear message when the sibling is missing; `test-all.sh` always runs them |
| PL-10 on real Chromebooks | Target not verified | Record the build-machine time, and list the Chromebook check under "Not verified", as Phases 2 and 3 did |

## 12. Definition of done for this plan

- The five repos meet `PLAN.md`'s per-tool Definition of done, and every spec acceptance box is ticked or explained in `STATUS.md`.
- `scripts/test-all.sh --e2e` runs every tool and passes.
- `vendor-manifest.json`, `ecosystem/README.md` and the root `README.md` tool table list the new repos and files.
- `QUESTIONS.md` has Q11 to Q30 with any teacher answers applied, and `ERRATA.md` has any new interpretation notes.
- Checkpoint C report written, and the GitHub repos created and pushed after approval.
