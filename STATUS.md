# Build status

Progress record for `PLAN.md`. A resumed session starts here.

**Current goal:** `PLAN-REMAINING-TOOLS.md` Phase 7 (PredictionLogCollector).
**Current phase:** Phase 7 done, at checkpoint C (the end of `PLAN-REMAINING-TOOLS.md`). PredictionLogCollector is on GitHub, `main` at 789fc39. UnitsFormulaChecker (`main` f15e401), ConveyorDesigner (`main` 72773a8), FlywheelBrakeLab (`main` b55431b) and FrictionScrewLab (`main` 264590d) are on GitHub. Next, after review: Phase 8 (Gear Train Workbench upgrades) and Phase 9 (Truss Stress Visualizer upgrades), as their own goals.

**Repos:** EngineeredByTheNumbers, ShaftBeamWorkbench and MotorDriveMatcher have been on GitHub under billvanloo since 2026-10-01. The Checkpoint B notes below about local-only repos are history.

## Done

### Phase 7: PredictionLogCollector (2026-11-02), commit 789fc39
- `~/PredictionLogCollector` (a sibling of this repo): `index.html` v1.0.0, `dev/core.js`, `dev/test.js`, `dev/verify-html.js`, `dev/e2e.js`, `dev/fixtures/` (a seeded class generator and the Sheets-style CSV), README, `docs/spec.md`, `docs/conventions.md`, screenshots.
  - Core: `loadFiles` (per-file results with reasons and warnings, merge, dedupe), `filter` (module through the tool-to-module table, tool, problem, quantity, student, team, period, date range), `problemSummary` (first-try median |%|, share within 5%, median tries to within 5% and how many haven't got there), `studentSummary` (with a trend from the earlier and later halves of first tries in date order), `measuredVsModel`, `sortBy` and `totals`. Medians everywhere.
  - Interface (mockup 07): Files and Filters on the left (drop zone that also works from the keyboard, status line, failed files with reasons, warnings, Clear loaded data, "Nothing leaves this browser"), Summary, Records and Students tabs in the centre, Record format, Export merged CSV and Print summary on the right. Tables sort from their headings by mouse or keyboard, with `aria-sort` and an announcement. Records page 100 rows at a time instead of the plan's virtualised table: simpler, and 20,000 records stay fast. Measured against model is drawn with `plot.js` and a dashed 0% line; groups of more than 30 values become a box (the middle half) with lines to the smallest and largest. Show the working walks through the top row of the summary.
  - Uses the shell's teacher-tool settings (`predictFirst: false`, `nameField: false`, `onFiles`); no shell change was needed.
- **Shared change, prediction-log 1.2.0:** reading a CSV saved back from Google Sheets. Blank rows are skipped, Sheets' `M/D/YYYY H:MM:SS` and `YYYY-MM-DD HH:MM:SS` dates are turned back into ISO time, and dedupe matches on the wall-clock time, so a re-saved copy is a duplicate of its original. A JSON file of another kind now fails with "this is a "shaft-loads" file, not a prediction log". Ecosystem tests 307; synced into every tool.
- **Bugs found and fixed while testing:** a saved filter stayed active after a reload while its drop-down showed "All students" (the value is now listed and marked "not in the loaded files"); the chart's x tick labels were removed with a pattern that also took out the axis title.
- **Spec findings:** none of the PL values disagree. QUESTIONS Q27 to Q29 and Q31 updated to what was built.
- **Acceptance (spec 07 §6):**
  - [x] The format is one shared module, `ecosystem/prediction-log.js`, copied exactly into tools 01 to 06, the Collector and the shell demo (`sync-vendor.js --check`). The two existing tools get it in Phases 8 and 9.
  - [x] All test cases pass: PL-1 to PL-5 in `ecosystem/test`, PL-6 to PL-11 in `dev/test.js` and through the page in `dev/e2e.js`. PL-10: 500 files and 20,000 records load, summarize and draw in about 0.3 s in headless Chromium (0.2 s in Node); a real Chromebook is not verified.
  - [x] Summaries use the median of the absolute percent difference, and the help panel says why ("a few wild predictions don't swamp the picture"); e2e checks the text.
- **Cross-tool check:** e2e opens each sibling tool from disk, makes one prediction, exports its log as JSON, and loads all six into the Collector: one tool name each, no failures.
- **Definition of done:** unit 43/43, inline 4/4, e2e 98/98, works from file:// with no network requests, and the screenshot matches mockup 07's three columns.

### Phase 6: UnitsFormulaChecker (2026-11-01), commit f15e401
- `~/UnitsFormulaChecker` (a sibling of this repo): `index.html` v1.0.0, `dev/core.js`, `dev/test.js`, `dev/verify-html.js`, `dev/e2e.js`, README, `docs/spec.md`, `docs/conventions.md`, screenshots.
  - Core: a units table built from §3.3's exact definitions; a tokenizer and Pratt parser that read units only right after numbers; an evaluator that carries dimensions, angle tags, torque or energy kind, absolute-temperature and percent tags; display units chosen from compatible families; the §3.5 detectors with fixes; a converter; the 18-formula library with sources; and a rearranger that records each step and declines when the unknown appears more than once.
  - Interface: Worksheet tab (one input per line, live values, unit dropdowns, ✓ ℹ ⚑ ✗ marks, Enter, arrow keys and Backspace, insert from the library), a line-details panel with dimensions, kind choice, flags and Apply fix, an all-results list, Convert tab, and Formula library tab with Insert and Rearrange. The worksheet is drawn as an SVG sheet for the PNG export and the report.
- **Bugs found and fixed while testing:** `2 kg * g` was read as kg·grams (a `*` after a unit now joins units only with no space before it; QUESTIONS Q36), and selecting a percent line crashed the details panel (the percent family had no name; now unit-tested).
- **Spec findings:** none of the UF values disagree. QUESTIONS Q36 (how units and variables that share letters are read); Q23 to Q25 are built as their defaults.
- **Acceptance (spec 06 §6):**
  - [x] All test cases pass in Node (parser, dimensions, conversion, detectors) and in the interface. UF-1 to UF-14 are all in `dev/test.js` and all are checked through the interface.
  - [x] Every conversion constant traces to §3.3 and is listed in help: `dev/test.js` checks each factor against the definitions, and e2e checks the help panel and the Convert tab list them.
  - [x] A worksheet of 30 lines recalculates in under 50 ms: 6.0 ms for a full update in headless Chromium (0.3 ms in Node).
  - [x] Screen readers hear each line's result and any flag: Enter announces the line through the polite live region, including flags and Apply fix; e2e checks the text.
- **Definition of done:** unit 119/119, inline 4/4, e2e 92/92, works from file:// with no network requests, and the screenshot matches mockup 06's three columns.

### Phase 5: ConveyorDesigner (2026-11-01), commit 72773a8
- `~/ConveyorDesigner` (a sibling of this repo): `index.html` v1.0.0, `dev/core.js`, `dev/test.js`, `dev/verify-html.js`, `dev/e2e.js`, README, `docs/spec.md`, `docs/conventions.md`, screenshots.
  - Requirements tab: an editable sheet (quantity, check type, target, tolerance), scored live; example rows from the mockup.
  - Design tab: a side view to scale along the bed with boxes moving at the loaded belt speed, T₁, T₂, the side load, a slip mark and the incline flag; six step sections, each with its own predict-first Check; a step strip marking steps with failing requirements; the motor's torque-speed plot with the operating point and duty bands.
  - Design record tab: the printable calculation package.
  - Exports shaft-loads and drive-request files; Load reads the Motor and Drive Matcher's drive result.
- **Shared code:** MotorCore and BeamCore are vendored unchanged. New `ecosystem/test/fixtures/conveyor-shared.json` (CD-5, CD-6, CD-7) is checked by `ecosystem/test/test-shared-fixtures.js` against the cores and by the conveyor's `dev/test.js` against its own core, which must give the same numbers exactly. `sync-vendor.js` and `verify-blocks.js` now copy data files without inlining them.
- **Shell 1.2.2:** `report().lead` sections print before the drawing. **e2e kit 1.2:** `kit.standard` handles tools with one Check per step.
- **Flaky test fixed in FrictionScrewLab:** its drag check measured the drawing while the sliding block's arrival at the bottom redrew it, so it failed about one run in three. The test now measures again when that happens (four clean runs in a row after the fix).
- **Spec findings:** ERRATA note on CD-5 in the interface (84.1 rpm, −11.9% with linked values). QUESTIONS Q35 (throughput requirement uses the loaded speed); the defaults for Q19 to Q22 and Q30 are what was built; `schemas.md` now shows the side load at 180°.
- **Acceptance (spec 05 §9):**
  - [x] All test cases pass in Node and in the interface. CD-1 to CD-10 are all in `dev/test.js` and all are checked through the interface; CD-10 runs in the real Shaft and Beam Workbench (M 1.28 N·m, τ_max 14.4 MPa, n 13.8, reactions 25.7 N).
  - [x] The design record prints on letter paper with the requirements table first, then each section's working, then sources. e2e checks the heading order and renders a letter-size PDF.
  - [x] Every number in the design record carries a unit: e2e checks every input and result cell; dimensionless values say "(no unit)".
  - [x] The embedded motor and shaft calculations give identical results to files 02 and 01 for the same inputs (shared fixtures, exact equality).
- **Definition of done:** unit 80/80, inline 5/5, e2e 121/121, works from file:// with no network requests, and the screenshot matches mockup 05's three columns. A drive request also makes a round trip through the real Motor and Drive Matcher.

### Phase 4b: FlywheelBrakeLab (2026-11-01), commit b55431b
- `~/FlywheelBrakeLab` (a sibling of this repo): `index.html` v1.0.0, `dev/core.js`, `dev/test.js`, `dev/verify-html.js`, `dev/e2e.js`, README, `docs/spec.md`, `docs/conventions.md`, screenshots (light, dark and the Data tab).
  - Model tab: wheel builder (disk, hoop, disk + hoop, custom I), lever with pivot offset and direction, spin up and brake (button or hold B) at true speed or ¼ and 1/10, pad heating, energy bar split between brake heat and bearing drag, self-locking shown as a result.
  - Data tab: three formats (frame counts with fps, time and turns, time per turn), paste or CSV upload, example data, braking and coast-down runs, a least-squares fit over a window set by drag or keyboard, plots of θ(t), ω(t) and residuals, coast-down copied into the model as T_d.
  - Compare tab: model against data for t, T_b and μ, with the measured values added to the student's log.
  - Three example challenges built on FB-1, FB-2 and FB-3.
- **Spec findings:** none of the FB values disagree. New questions Q33 (drum radius for disk + hoop and custom I) and Q34 (meaning of "time per turn"); Q16 and Q17 updated to what was built.
- **Acceptance (spec 04 §8):**
  - [x] All test cases pass in Node and in the interface. FB-1 to FB-12 are all in `dev/test.js`. FB-1 to FB-8 and FB-10 to FB-12 are also checked through the interface; FB-9 is a calculation check (3000 J into 1 kg of steel) done in Node.
  - [x] The animated stop time matches the computed t within one animation frame at 1×: stepping one 60 Hz frame at a time, the wheel stops at 0.8976 s against t = 0.8976 s. The stop is found inside the frame, so it is exact.
  - [x] The fit plot shows data, curve and residuals (plus ω(t)); the window is shaded, and both edges can be dragged or moved one data point at a time with the arrow keys.
  - [x] Show the working covers the lever moments with the sign choice explained, T_b, I, α, t, KE and ΔT, and for data the fitted coefficients and how α becomes T_b and μ.
  - [x] The help panel has a one-page student guide to counting frames in phone slow-motion video (a draft for review, Q18).
- **Definition of done:** unit 73/73, inline 5/5, e2e 119/119, works from file:// with no network requests, a full update takes 3.2 ms (headless Chromium), and the screenshot matches mockup 04: inputs, the lever and wheel with the energy bar and data fit, then the results with the comparison.

### Phase 4a: FrictionScrewLab (2026-11-01), commit 264590d
- `~/FrictionScrewLab` (a sibling of this repo): `index.html` v1.0.0, `dev/core.js`, `dev/test.js`, `dev/verify-html.js`, `dev/e2e.js`, README, `docs/spec.md`, `docs/conventions.md`, screenshots (light and dark).
  - Ramp: simulate (drag or arrow keys, block animation at the computed acceleration, force diagram with values) and measure (static and kinetic trial lists, dot plot, mean, range, sample standard deviation).
  - Send μ to Screw, and "Use Ramp result" to keep μ linked.
  - Screw jack: three thread forms, collar, measured diameters, hold-to-raise and hold-to-lower with release behaviour, unrolled-thread triangle with zoom, back-calculation from a measured handle force.
  - Three example challenges: mystery surface (hidden μ), FS-6 and FS-7/8, the last two gated on a checked prediction.
- **Shell 1.2.1:** yes/no predict targets (`kind: 'yesno'`, logged as 1/0, Q13), used for "self-locking". Invalid built-in challenges are now a console error, so the standard e2e catches them (this caught a real bug in the tool's own list). The help text and `schemas.md` say challenge inputs use the tool's own design-file units.
- **Spec findings:** ERRATA has FS-10 (thread μ range conflict; the field accepts up to 1.0) and FS-12 (rounding of the sent μ). QUESTIONS Q32: τ at the root uses the thread torque.
- **Acceptance (spec 03 §8):**
  - [x] All test cases pass in Node and in the interface. FS-1 to FS-12 are all in `dev/test.js`. FS-1 to FS-12 are also checked through the interface (FS-3 and FS-12 in measure mode, FS-8 in the working, FS-11 as a field message).
  - [x] The release animation matches the self-locking result every time. Five configurations (FS-4, FS-6, FS-8, FS-7 without its collar, a 3-start screw) each check hold when T_L,total ≥ 0 and drop when it is below 0, using the manual animation clock.
  - [x] The unrolled-thread triangle is drawn to true angle: e2e reads the polygon and gets λ = 4.05° at ×1 and ×5 zoom. Zoom works from the keyboard.
  - [x] Show the working has the tangent form T_R = (W d_m/2) tan(φ + λ) for square threads, with the same 4.02 N·m (not shown for Acme or trapezoidal).
- **Definition of done:** unit 94/94, inline 5/5, e2e 152/152, works from file:// with no network requests, a full update takes 4.2 ms (headless Chromium), and the screenshot matches mockup 03's three columns.

### Phase 4.0: shared groundwork (2026-11-01)
- **Shell 1.2** (`ecosystem/shell/`), all additions opt-in:
  - header tabs (`cfg.tabs`, keyboard tablist)
  - challenges: built-in examples, a teacher list pasted in Settings, hidden inputs, per-challenge tolerance, the challenge ID as problem ID and file context, `app.gate()` for 00 §4.6
  - grouped predict targets (one Check per group) and grouped working, in the panel and the report
  - `predictFirst: false` and `nameField: false` for a teacher tool, and `onFiles` for many files at once
  - report `sections`
- **Bug fixed in the published shell:** pressing Enter in a prediction box ran Check, and then the same key press activated "Predict again", which undid the Check at once. Confirmed against MotorDriveMatcher's published `index.html` (the new kit check fails there and passes after the sync). Both tools get the fix with this sync.
- **CSS fix:** `.namewrap` and the new `.chwrap` set `display:flex`, which overrode the `hidden` attribute.
- **New shared modules** with unit tests: `stats.js` (FS-3 and FB-6 values checked), `plot.js`, `anim.js` (fake-frame and manual-clock tests), `hold.js` (browser-tested in the demo).
- **e2e kit 1.1:** `start(root, { page, query })`, `standard(t, { teacherTool })`, and a new standard check that Enter in a prediction box keeps the results shown.
- **Demo** now uses tabs, a Sandbox/Challenge switch with example challenge DM-1, a gated hold-to-spin control and an animation clock. `dev/fixture-v12.html` covers grouped predict-first and the teacher-tool settings.
- **Docs:** `ecosystem/README.md` (new files and config), `schemas.md` (challenge-list format, problem ID prefixes, prediction quantity names, the tool-to-module table), `QUESTIONS.md` Q11 to Q31.
- **Regression:** ShaftBeamWorkbench and MotorDriveMatcher pass all their unit, inline and browser checks on shell 1.2 (102 and 121 e2e, one more each than before: the Enter check).
- **Tool repos:** the sync changes `dev/vendor/` and the inline blocks in both tools. MotorDriveMatcher has it on branch `claude/festive-hawking-uxdha3` (commit 01bc5db), not on `main`. ShaftBeamWorkbench passed every check with it locally, but push access to that repo was refused in this session, so nothing was pushed there.

### Phase 0: setup and spec check (2026-09-27)
- Curriculum repo `EngineeredByTheNumbers` initialized with git (`main`), with README, LICENSE (MIT), `.gitignore`, `curriculum/` placeholder, `ERRATA.md` and `QUESTIONS.md`.
- `scripts/check-spec-values.js` recomputes 222 spec values from the formulas alone. **All 222 agree.** The interpretation notes are in `ERRATA.md`.
- Existing repos read for reference. Findings:
  - **Palette and themes:** Gear Train Workbench `index.html` lines 22–86. Tokens `--paper --grid-minor --grid-major --ink --ink-soft --line --dykem --dykem-soft --brass --brass-ink --pass --fail --dro-bg --dro-amber --panel --field --rule --th-bg --scrim`, and so on. Light is "drafting paper", `data-theme="dark"` is "blueprint". A pre-paint script in `<head>` sets `data-theme` from local storage or the OS setting.
  - **Header:** `.titleblock` (`.t1` uppercase name, `.t2` subtitle), `.modes` segmented Sandbox/Challenge, `.namewrap` Name field, `.hbtns` (Export image, Report / PDF, Save, Load, theme, ?).
  - **Readout:** the "DRO" bar: dark background, amber monospace values, `.dro-cell`, `.dro-label`, `.dro-val`.
  - **Show the working:** a `<details id="workingBox">` with `.wk-table`.
  - **Footer:** a reusable attribution block (Designed by Bill Van Loo, AI note, bug and feature `mailto:billvanloo.tech+feedback@gmail.com?subject=[Tool] …`, Ko-fi, MIT License link, View source).
  - **Help:** a modal (`#modalBack`, `#modal`) with `<kbd>` key lists.
  - **Report:** a hidden `#report` div shown only under `@media print`, followed by `window.print()`, with `document.title` set to the export name.
  - **Exports** always use the light palette (`withLightPalette`). Export names come from a pure `buildExportName()`.
  - **Tests:** `dev/solver.js` is the tested copy, and `dev/test.js` uses an `eq(name, actual, expected, eps)` helper with PASS/FAIL counts. `dev/verify-html.js` slices the inline solver out of `index.html` between markers and runs it. `dev/e2e.js` uses Playwright against a tiny static server on the repo root.
  - **Truss Stress Visualizer:** same header, DRO and footer pattern, light theme only.
  - **Small-screen notice:** neither tool shows an on-screen notice today (QUESTIONS Q1).

### Phase 1: ecosystem foundation (2026-09-27)
- `ecosystem/prediction-log.js`: record format, percent difference, attempts, JSON and CSV (BOM, CRLF, RFC 4180), parse, dedupe, TSV row. Covers PL-1 to PL-5 and PL-7 and PL-8, plus PL-6 at module level.
- `ecosystem/schemas.js` and `schemas.md`: shaft-loads, drive-request, drive-result and the design-file envelope with migration.
- `ecosystem/shell/`: shell.css (both themes), shell.js (the full `00 §2–8` frame) and head-snippet.html.
- `ecosystem/shell/demo/`: the smallest tool on the shell. It passes 46 standard browser checks, including file:// with no network requests.
- `ecosystem/tooling/`: verify-blocks.js (inline-copy check, core sync) and e2e-kit.js (Playwright; falls back to the cached Chromium in ~/.cache/ms-playwright).
- `scripts/sync-vendor.js` (with `--check`), `scripts/test-all.sh` (with `--e2e`) and `ecosystem/vendor-manifest.json`.
- **Playwright setup:** `npm i --no-save playwright@1.63.0` in each repo root. The pinned browser build (1243) isn't downloaded, so the kit uses the cached chromium-1228 automatically.

### Phase 2: ShaftBeamWorkbench (2026-09-27), commit 86b738a
- `ecosystem/beam-core.js` has 59 unit checks in `ecosystem/test/test-beam-core.js`.
- `~/GitHub/ShaftBeamWorkbench` repo:
  - `index.html`: v1.0.0, Shaft and Beam modes, stacked SVG diagrams, drag, click-to-place, keyboard control, station readout, import dialog, extension options.
  - `dev/core.js` and tests: 75 unit (SB-1 to SB-15 plus CD-10), 6 inline, 101 e2e.
  - README, docs/spec.md, docs/conventions.md and screenshots (light and dark).
- **Shell fixes made along the way:** header fits at 1280 px; select fields are wider; report header rows are marked `hd` so row labels keep their case (σ/τ were printing as Σ/T); the e2e kit resolves relative roots.
- **Found and fixed:** SVG `clipPath` IDs have to be unique per rendering, because the report embeds a second copy of the drawing. Every tool drawing must prefix its IDs (`uid` in the Shaft and Beam Workbench).
- **Acceptance (spec 01 §9):**
  - [x] All test cases pass in Node and match in the interface. Every SB case is in `dev/test.js`. SB-3, 6, 7, 10, 11, 13, 14 and 15 are also checked through the interface in e2e.
  - [x] Moving a load updates every diagram in under 50 ms. Measured 16.6 ms median in headless Chromium on the build machine. A real Chromebook still needs a manual check.
  - [x] Show the working lists the reactions, M at the critical section, T, σ, τ, the combined value, n and the required d, with substituted numbers and units.
  - [x] Predict first hides R_A, |M|max, n and the required d, plus the moment peak label (and the reactions, shear jump values, critical marker and station readout).
  - [x] The exported report reproduces the diagrams and every readout. Checked by rendering the report to PDF.
  - [x] A keyboard-only session can add, move and delete loads and read the station readout.
- **Definition of done:** the screenshot matches the mockup's three-column arrangement (inputs, drawing, then results with predict-first and the working).

### Phase 3: MotorDriveMatcher (2026-09-27), commit 8ca1e02
- `ecosystem/motor-core.js` has 38 unit checks in `ecosystem/test/test-motor-core.js`.
- `~/GitHub/MotorDriveMatcher` repo:
  - `index.html`: v1.0.0, torque-speed plot with duty bands and power curve, drag and keyboard load control, stages, three load types, ratio solver with rounding (including the nearest gear pair), compare motors, current and efficiency extension.
  - Drive-request import and drive-result export.
  - Teacher settings for the band edges and the motor list (JSON).
  - `dev/core.js` and tests: 56 unit, 5 inline, 96 e2e. README, docs and screenshots.
- **Shell and kit fixes made along the way:** Clear my data cancels a pending autosave. The e2e kit's `fresh()` goes through a blank same-origin page, because a pending autosave could write old state back between the clear and the reload, which made one check flaky.
- **Acceptance (spec 02 §8):**
  - [x] All test cases pass in Node and in the interface. Every MD case is in `dev/test.js`, and MD-1, 2, 3, 5, 6, 7, 8, 9, 10 and 11 are also checked through the interface.
  - [x] The operating point moves continuously while dragging, with the readout updating live (10.5 ms per update).
  - [x] Show the working lists T_L, T_m, percent of stall, N_m and N_out, and for the solver the quadratic with numbers substituted and both roots.
  - [x] Predict first hides the operating point dot, N_out and the solver result (and everything else that gives them away).
  - [x] The help panel explains in one paragraph why the no-load speed gives the wrong ratio, using MD-1 and MD-2.
- **Definition of done:** the screenshot matches the mockup's three columns. One difference is deliberate: there's no Sandbox/Challenge switch (QUESTIONS Q7).

## Checkpoint B report

### Repos (local git only, no remotes, nothing pushed)
| Repo | Path | Latest commit |
|---|---|---|
| EngineeredByTheNumbers (curriculum) | `~/GitHub/EngineeredByTheNumbers` | see `git log` |
| ShaftBeamWorkbench | `~/GitHub/ShaftBeamWorkbench` | cc2bf6b |
| MotorDriveMatcher | `~/GitHub/MotorDriveMatcher` | 8ca1e02 |

### Tests
`scripts/test-all.sh --e2e` passes everything: spec check 222/222, ecosystem 193, demo 2 + inline + 46 e2e, Shaft and Beam 75 + 6 + 101, Motor and Drive 56 + 5 + 96.

### Screenshots
- `ShaftBeamWorkbench/docs/screenshots/shaft-beam-workbench-{light,dark}.png`
- `MotorDriveMatcher/docs/screenshots/motor-drive-matcher-{light,dark}.png`

### For review
- `ERRATA.md`: no spec value is wrong. There are interpretation notes: MD-2, SB-12, SB-3, CD-5/6, CD-7, TV-1d, PL-1, plus two display-rounding notes (MD-1 P_out shows 5.98, MD-2 N_out at 2.70 shows 95.6).
- `QUESTIONS.md`: Q1 to Q10. Q4 (placeholder material values) and Q7 (no challenge lists in specs 01 and 02) need teacher input.
- Blocked: nothing.
- **Not verified:** the 50 ms target on a real Chromebook (measured 16.6 ms and 10.5 ms in headless Chromium on the build machine); Safari and Firefox; screen-reader listening (live regions and labels are in place and checked structurally only).

### Proposed next step (needs approval)
Create the three GitHub repos (EngineeredByTheNumbers, ShaftBeamWorkbench, MotorDriveMatcher) under billvanloo, push `main`, and turn on GitHub Pages for the two tools. After that, Phase 4 (FrictionScrewLab, FlywheelBrakeLab) as the next goal.

## Checkpoint C report (2026-11-02)

The end of `PLAN-REMAINING-TOOLS.md`: Phases 4.0 to 7 are built.

### Repos
| Repo | `main` on GitHub | `claude/festive-hawking-uxdha3` |
|---|---|---|
| EngineeredByTheNumbers | fb126d2 | this branch: the plan, shared code and records for Phases 4.0 to 7 |
| ShaftBeamWorkbench | d559400 | can't be pushed from this session; needs the vendor sync (below) |
| MotorDriveMatcher | 9ac3502 | 25faf23: shell 1.2.2, kit 1.2, prediction-log 1.2 |
| FrictionScrewLab | 264590d | 71a1217: shell 1.2.2, kit 1.2, a test fix, prediction-log 1.2 |
| FlywheelBrakeLab | b55431b | 6058a56: shell 1.2.2, kit 1.2, prediction-log 1.2 |
| ConveyorDesigner | 72773a8 | d373fe2: prediction-log 1.2 |
| UnitsFormulaChecker | f15e401 | db61389: prediction-log 1.2 |
| PredictionLogCollector | 789fc39 | — |

### Tests
`scripts/test-all.sh --e2e` passes everything (2026-11-02): spec check 222/222, ecosystem 307, shell demo 2 + inline + 139 e2e, and every tool as in the table at the end of this file.

### Screenshots
`docs/screenshots/` in each tool repo: light and dark for every tool, plus `prediction-log-collector-class.png` (a class of 125 students, 20,000 records) and `perf.txt` timings where a spec sets a target.

### For review
- `ERRATA.md`: FS-10 (μ beyond §4's range) and FS-12 (rounding) are interpretation notes; no spec value is wrong.
- `QUESTIONS.md` Q11 to Q36, each with what the build does. These need a teacher answer: Q19 (motor power margin), Q27 (a `module` field in the log), Q29 (one real Google Sheets file), Q32 (screw stress torque), and the placeholder values in Q4 and Q17.
- Merges: the `claude/festive-hawking-uxdha3` branches above are ready to merge into `main` (each passes its full suite). ShaftBeamWorkbench: check it out beside this repo, run `node scripts/sync-vendor.js`, then `scripts/test-all.sh --e2e`, and commit there.
- **PredictionLogCollector:** on `main` of `billvanloo/PredictionLogCollector`, on top of the repo's initial LICENSE commit (its copyright line now reads "Bill Van Loo", like the other repos).
- GitHub Pages is still off for every new tool.

### Not verified
- PL-10 and the other speed targets on a real Chromebook (build machine: 0.3 s in headless Chromium for 20,000 records).
- A real Google Sheets round trip (Q29); a synthetic Sheets-style file is tested.
- Safari and Firefox; screen-reader listening (live regions and labels are checked structurally); hold and animation on a touch screen.

### Proposed next step (needs approval)
Phases 8 and 9 (the Gear Train Workbench and Truss Stress Visualizer upgrades) as their own goals.

## Phase 4.0 review checkpoint

### For review
- Shell 1.2 and the Enter fix: merge MotorDriveMatcher's `claude/festive-hawking-uxdha3` branch. For ShaftBeamWorkbench, run `node scripts/sync-vendor.js` with it checked out beside this repo, run `scripts/test-all.sh --e2e`, and commit there (this session couldn't push to it).
- QUESTIONS Q11 to Q31, especially Q19 (motor power margin), Q24 (rpm in ω = 2πN/60) and Q27 (module field).

### Not verified
- Hold and the animation clock on a real touch screen (checked with mouse and keyboard in headless Chromium).

### For review (Phase 4a)
- **FrictionScrewLab:** merged into `main` of `billvanloo/FrictionScrewLab` (fast-forward over the repo's initial LICENSE commit; the copyright line now reads "Bill Van Loo", like the other repos). Turn on GitHub Pages to publish it.
- MotorDriveMatcher's `claude/festive-hawking-uxdha3` branch carries shell 1.2.1. ShaftBeamWorkbench still needs the sync (no push access in this session).
- ERRATA FS-10 and FS-12; QUESTIONS Q32 and the defaults used for Q11 to Q15.

### For review (Phase 6, checkpoint C2)
- **UnitsFormulaChecker:** on `main` of `billvanloo/UnitsFormulaChecker`, on top of the repo's initial LICENSE commit (its copyright line now reads "Bill Van Loo", like the other repos). Kept as its own repo rather than in this one: it shares no code with the other tools, only the prediction-log format. Turn on GitHub Pages to publish it.
- QUESTIONS Q23 to Q25 and Q36.

### For review (Phase 5)
- **ConveyorDesigner:** on `main` of `billvanloo/ConveyorDesigner`, on top of the repo's initial LICENSE commit (its copyright line now reads "Bill Van Loo", like the other repos). Turn on GitHub Pages to publish it.
- The shell 1.2.2 and kit 1.2 updates are synced into every tool repo's working copy. MotorDriveMatcher, FrictionScrewLab and FlywheelBrakeLab get them on their `claude/festive-hawking-uxdha3` branches; ShaftBeamWorkbench still can't be pushed from this session.
- QUESTIONS Q19 to Q22, Q30 and Q35.

### For review (Phase 4b, checkpoint C1)
- **FlywheelBrakeLab:** pushed to `main` of `billvanloo/FlywheelBrakeLab` (the repo was empty, so `main` is its default branch). Turn on GitHub Pages to publish it.
- QUESTIONS Q16 to Q18, Q33 and Q34.

## Next
- Checkpoint C review. Then Phase 8 (Gear Train Workbench) and Phase 9 (Truss Stress Visualizer), as their own goals.

## Blocked
- None.

## Test counts
| Repo | Unit | Verify | e2e |
|---|---|---|---|
| EngineeredByTheNumbers (spec check) | 222/222 | n/a | n/a |
| EngineeredByTheNumbers (ecosystem) | 307/307 | current | demo 139/139 |
| ShaftBeamWorkbench | 75/75 | 6/6 | 102/102 |
| MotorDriveMatcher | 84/84 | 6/6 | 121/121 |
| FrictionScrewLab | 94/94 | 5/5 | 152/152 |
| FlywheelBrakeLab | 73/73 | 5/5 | 119/119 |
| ConveyorDesigner | 80/80 | 5/5 | 121/121 |
| UnitsFormulaChecker | 119/119 | 4/4 | 92/92 |
| PredictionLogCollector | 43/43 | 4/4 | 98/98 |
