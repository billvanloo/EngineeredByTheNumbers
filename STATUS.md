# Build status

Progress record for `PLAN.md`. A resumed session starts here.

**Current goal:** Phases 0 to 3, stopping at Checkpoint B.
**Current phase:** Checkpoint B reached (end of the current goal). The next step is the user's review, then creating the GitHub repos.

## Done

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

## Next
- Waiting for review at Checkpoint B.

## Blocked
- None.

## Test counts
| Repo | Unit | Verify | e2e |
|---|---|---|---|
| EngineeredByTheNumbers (spec check) | 222/222 | n/a | n/a |
| EngineeredByTheNumbers (ecosystem) | 193/193 | current | demo 46/46 |
| ShaftBeamWorkbench | 75/75 | 6/6 | 101/101 |
| MotorDriveMatcher | 56/56 | 5/5 | 96/96 |
