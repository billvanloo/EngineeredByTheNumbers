# Build status

Progress record for `PLAN.md`. A resumed session starts here.

**Current goal:** Phases 0 to 3, stopping at Checkpoint B.
**Current phase:** Phase 1, ecosystem foundation.

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

## Next
- Phase 1: `ecosystem/prediction-log.js`, schemas and validators, the shell and its demo, `sync-vendor.js`, `test-all.sh`.

## Blocked
- None.

## Test counts
| Repo | Unit | Verify | e2e |
|---|---|---|---|
| EngineeredByTheNumbers (spec check) | 222/222 | n/a | n/a |
