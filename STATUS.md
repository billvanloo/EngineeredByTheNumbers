# Build status

Progress record for `PLAN.md`. A resumed session starts here.

**Current goal:** `PLAN-REMAINING-TOOLS.md` Phase 4a (FrictionScrewLab).
**Current phase:** Phase 4a done. FrictionScrewLab is on GitHub on branch `claude/festive-hawking-uxdha3` (commit 264590d), waiting to be merged into `main`. Next is Phase 4b (FlywheelBrakeLab), then checkpoint C1.

**Repos:** EngineeredByTheNumbers, ShaftBeamWorkbench and MotorDriveMatcher have been on GitHub under billvanloo since 2026-10-01. The Checkpoint B notes below about local-only repos are history.

## Done

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

## Phase 4.0 review checkpoint

### For review
- Shell 1.2 and the Enter fix: merge MotorDriveMatcher's `claude/festive-hawking-uxdha3` branch. For ShaftBeamWorkbench, run `node scripts/sync-vendor.js` with it checked out beside this repo, run `scripts/test-all.sh --e2e`, and commit there (this session couldn't push to it).
- QUESTIONS Q11 to Q31, especially Q19 (motor power margin), Q24 (rpm in ω = 2πN/60) and Q27 (module field).

### Not verified
- Hold and the animation clock on a real touch screen (checked with mouse and keyboard in headless Chromium).

### For review (Phase 4a)
- **FrictionScrewLab:** `billvanloo/FrictionScrewLab` branch `claude/festive-hawking-uxdha3` holds the tool on top of the repo's initial LICENSE commit (its copyright line now reads "Bill Van Loo", like the other repos). Merging it into `main` is a fast-forward; then turn on GitHub Pages.
- MotorDriveMatcher's `claude/festive-hawking-uxdha3` branch carries shell 1.2.1. ShaftBeamWorkbench still needs the sync (no push access in this session).
- ERRATA FS-10 and FS-12; QUESTIONS Q32 and the defaults used for Q11 to Q15.

## Next
- Phase 4b (FlywheelBrakeLab), then checkpoint C1.

## Blocked
- None.

## Test counts
| Repo | Unit | Verify | e2e |
|---|---|---|---|
| EngineeredByTheNumbers (spec check) | 222/222 | n/a | n/a |
| EngineeredByTheNumbers (ecosystem) | 287/287 | current | demo 139/139 |
| ShaftBeamWorkbench | 75/75 | 6/6 | 102/102 |
| MotorDriveMatcher | 84/84 | 6/6 | 121/121 |
| FrictionScrewLab | 94/94 | 5/5 | 152/152 |
