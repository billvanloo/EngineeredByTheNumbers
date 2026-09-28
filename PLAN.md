# Engineered by the Numbers: build plan

Plan for turning the spec package in `engineered-by-the-numbers-tool-specs/` into working tools. Written to be run as a long autonomous goal. `STATUS.md` records progress so a fresh session can pick up where the last one stopped.

**Current goal scope: Phases 0 to 3, ending at Checkpoint B.** Later phases stay here for reference and will run as separate goals.

## Starting point (2026-09-27)

- `~/GitHub/EngineeredByTheNumbers` holds only the specs: `00` conventions, 9 tool specs, mockups and screenshots. No code yet, and no git repo.
- `~/GitHub/GearTrainWorkbench` (2161-line `index.html`, `dev/` with solver tests, `verify-html.js`, a Playwright `e2e.js`, `docs/spec.md`) and `~/GitHub/TrussStressVisualizer` (887-line `index.html`, `dev/test.js`, `verify-html.js`) are the existing tools that specs 08 and 09 extend. They are also the reference for look, feel, repo shape and the dev/test pattern.
- Node 22 and Playwright Chromium are installed (Playwright is in `GearTrainWorkbench/node_modules`).

## Repositories

One repo for the curriculum and one repo per tool, all side by side in `~/GitHub/`. Each tool works on its own and also plugs into the rest of the set through the shared file formats.

| Local folder / GitHub repo | Contents | Built in |
|---|---|---|
| `EngineeredByTheNumbers` | Curriculum: unit materials (HTML and more), the spec package, this plan, `STATUS.md`, `ERRATA.md`, `QUESTIONS.md`, and `ecosystem/` (the canonical shared code and schemas) | Phase 0 onward |
| `ShaftBeamWorkbench` | Tool 01 | Phase 2 |
| `MotorDriveMatcher` | Tool 02 | Phase 3 |
| `FrictionScrewLab` | Tool 03 | Phase 4 |
| `FlywheelBrakeLab` | Tool 04 | Phase 4 |
| `ConveyorDesigner` | Tool 05 | Phase 5 |
| `UnitsFormulaChecker` | Tool 06 | Phase 6 |
| `PredictionLogCollector` | Tool 07, Collector half | Phase 7 |
| `GearTrainWorkbench` (existing) | Upgrades from spec 08, on branch `ebtn-upgrades` | Phase 8 |
| `TrussStressVisualizer` (existing) | Upgrades from spec 09, on branch `ebtn-upgrades` | Phase 9 |

Repo names follow the existing CamelCase style (`GearTrainWorkbench`). GitHub doesn't allow spaces, so the curriculum repo is `EngineeredByTheNumbers`, and its README title is "Engineered by the Numbers".

### Curriculum repo layout

```
EngineeredByTheNumbers/
  README.md  PLAN.md  STATUS.md  ERRATA.md  QUESTIONS.md  LICENSE
  engineered-by-the-numbers-tool-specs/   (spec package, read-only for the run)
  curriculum/                             (unit materials; placeholder index for now)
  ecosystem/
    README.md             how the tools fit together; which tool reads and writes which file
    schemas.md            prediction-log, shaft-loads, drive-request, drive-result, design-file envelope
    prediction-log.js     07 Part A: record builder, % diff, JSON/CSV export, CSV parse
    beam-core.js          01 §3.1–3.5 (used by 01, 05, 09)
    motor-core.js         02 §3.1–3.5 (used by 02, 05, 08)
    shell/                header, footer, themes, help panel, predict-first, show-the-working,
                          save/load, PNG export, report, validation, live region
    test/                 unit tests for the ecosystem code, plus cross-tool fixtures
  scripts/
    check-spec-values.js  independent recompute of every spec test table
    sync-vendor.js        copies ecosystem/ files into each sibling tool repo's dev/vendor/
    test-all.sh           runs every tool repo's tests from one place
```

### Tool repo layout (the same for every new tool)

```
ShaftBeamWorkbench/
  index.html              the whole shipped tool, self-contained (00 §1)
  README.md  LICENSE (MIT)  .gitignore
  docs/spec.md            copy of the tool's spec, plus 00-shared-conventions as docs/conventions.md
  dev/
    core.js               the tool's own calculation core (plain SI in and out, no DOM)
    vendor/               copies of ecosystem files, each with a header naming its source and version
    test.js               every row of the spec's test table
    verify-html.js        inline blocks in index.html match dev/core.js and dev/vendor/*
    e2e.js                Playwright checks, same setup as GearTrainWorkbench/dev/e2e.js
```

**How sharing works without a build step:** code that several tools use lives once in `EngineeredByTheNumbers/ecosystem/`. `sync-vendor.js` copies it into each tool repo's `dev/vendor/` and into `index.html` between `/* BEGIN vendor:motor-core v1.0.0 */ … /* END */` markers. Each tool repo can still be cloned and tested alone, because it has its own vendored copy. `verify-html.js` in the tool repo fails if the inline copy drifts, and `test-all.sh` in the curriculum repo fails if a vendored copy is behind `ecosystem/`.

## Rules for the run

1. **Specs are the authority.** Don't change an expected value in a spec test table. If the independent recompute disagrees with a spec value, write it up in `ERRATA.md` (spec value, recomputed value, the working, and a likely cause). Implement the formula as the spec states it, mark the test `disputed` so it reports without failing the suite, and keep going. Don't stop for errata; they're reviewed at Checkpoint B.
2. **No invented formulas** (`00 §9`). If a tool needs a formula the spec doesn't give, log it in `QUESTIONS.md`, stub it with a visible "pending review" note, and continue.
3. **Existing repos are protected.** Read `GearTrainWorkbench` and `TrussStressVisualizer` for reference only in this goal. Don't modify them.
4. **Local git only.** `git init` each new repo on a `main` branch and commit at each green milestone, with the attribution line. Don't create GitHub remotes or push. Creating the GitHub repos is a step for after Checkpoint B, once the user approves.
5. **Green before moving on.** A tool counts as done only when its definition of done below is met. After 3 failed attempts at one item, log it in `STATUS.md` under Blocked, move to the next item, and return to it before declaring the checkpoint.
6. **Keep `STATUS.md` current.** It lives in the curriculum repo. Update it after every milestone with the current phase, what's done, what's next, blocked items, test counts per repo, and commit hashes. It's the only memory a resumed session has.
7. **Match the house style.** Before building the shell, read `GearTrainWorkbench/index.html` and copy its themes (drafting paper and blueprint), header and footer markup, footer links (with the mailto subject tag `[ShaftBeamWorkbench]` and so on per tool), help panel structure and keyboard conventions.

## Definition of done (per tool)

- Calculation core in `dev/core.js`: plain SI in, plain SI out, no DOM access.
- `dev/test.js` covers every row of the spec's test table (plus the `07` record tests for its predict-first targets). All pass, or are marked `disputed` with an `ERRATA.md` entry.
- `dev/verify-html.js` passes: the inline core and vendored blocks match the tested copies.
- `dev/e2e.js` (Playwright, headless) checks that:
  - the page loads with no console errors, and no `NaN` or `Infinity` appears in the DOM across the default state and the spec's edge-case tests
  - predict-first hides the listed targets and the on-canvas answers, and Check reveals them and writes a log record
  - changing an input re-hides the results
  - theme toggle works and is remembered
  - Save → Load round-trips the full state
  - Report opens with the drawing, inputs, outputs, working and sources
  - the PNG export is 2× with a caption strip
  - the notice appears below 768 px
  - the spec's keyboard interactions work
  - it takes a screenshot at 1280×800 in both themes
- The tool works opened straight from disk (`file://`), with no network requests.
- Screenshot reviewed against the spec's `mockups/NN-*.html`: same regions in the same arrangement.
- `README.md` covers what the tool is, quick start, teacher notes, how it connects to the other tools, development commands and the AI-assistance note, in the style of the existing READMEs.
- The spec's acceptance-criteria checklist is copied into `STATUS.md` and every box is ticked or explained.
- Performance targets in the spec (for example, 50 ms updates) are measured in e2e and the numbers recorded.

## Phases

### Phase 0: Setup and spec check
- `git init` the curriculum repo. Add `README.md`, `LICENSE` (MIT), `.gitignore`, a `curriculum/` placeholder, `STATUS.md`, `ERRATA.md` and `QUESTIONS.md`.
- Write `scripts/check-spec-values.js`: recompute every expected value in SB, MD, FS, FB, CD, UF, PL, WB and TV straight from the spec formulas, without any tool code, and report each against the spec within the `00 §10` tolerance. Log the mismatches in `ERRATA.md`. It checks all nine specs now so that the later phases start with known errata.
- Read both existing repos' `index.html` and `dev/` in full. Note in `STATUS.md` the theme tokens, markup patterns and test conventions to reuse.
- **Milestone A** (log it and continue, no stop): the spec check has run, errata are logged, and the first commit is made.

### Phase 1: Ecosystem foundation (in the curriculum repo)
- `ecosystem/prediction-log.js`: record format (`07 §3`), percent difference with the "not defined" rule, attempt counting, JSON and CSV export (RFC 4180, UTF-8 BOM), CSV parse, tab-separated "copy last row". Tests PL-1 to PL-5 and PL-7 at module level.
- `ecosystem/schemas.md` plus validators for shaft-loads, drive-request, drive-result and the design-file envelope (`tool`, `toolVersion`, `schemaVersion`, `savedAt`, with migration hooks).
- `ecosystem/shell/`: one tool skeleton that implements everything in `00 §2–8`, so each tool only supplies its inputs, core, drawing, readouts and working steps. Prove it with a throwaway demo page (kept in `ecosystem/shell/demo/`) that passes a generic e2e.
- `scripts/sync-vendor.js`, `scripts/test-all.sh` and `ecosystem/README.md`.

### Phase 2: `ShaftBeamWorkbench` (tool 01)
- Build `ecosystem/beam-core.js` first with its tests (reactions, V and M at 400+ stations, torque segment, Tresca and von Mises, critical-section scan, required diameter, deflection by double integration). Then create the repo, vendor the core in, and build the tool.
- Import the shaft-loads schema, with the two-plane warning (SB-15 uses a hand-written fixture file, since the Gear Train export doesn't exist yet).
- SB-1 to SB-15.

### Phase 3: `MotorDriveMatcher` (tool 02)
- Build `ecosystem/motor-core.js` first with its tests (motor line, parallel motors, stages, load types, stall, ratio solver quadratic, duty bands, current and efficiency). Then create the repo and build the tool.
- Drive-request in, drive-result out.
- MD-1 to MD-11.

### Checkpoint B (end of this goal)
Stop and report:
- the repos created, with their commit hashes
- test counts per repo, and `scripts/test-all.sh` output
- screenshots of both tools in both themes
- the definition-of-done checklist for each tool
- the contents of `ERRATA.md` (all nine specs) and `QUESTIONS.md`
- anything left under Blocked
- the proposed next step: creating the GitHub repos and pushing, which needs user approval

### Later phases (future goals, not this run)
- **Phase 4:** `FrictionScrewLab` (FS-1 to FS-12) and `FlywheelBrakeLab` (FB-1 to FB-12).
- **Phase 5:** `ConveyorDesigner`, which vendors `beam-core` and `motor-core` unchanged and has shared fixtures proving identical results to 01 and 02. CD-1 to CD-10, with CD-10 round-tripping into `ShaftBeamWorkbench` in e2e.
- **Phase 6:** `UnitsFormulaChecker`: UF-1 to UF-14 and the 30-line 50 ms check.
- **Phase 7:** `PredictionLogCollector`: PL-6 to PL-11. PL-10 uses generated data. For PL-11, write a CSV the way Google Sheets re-exports it and read it back. **Checkpoint C.**
- **Phase 8:** `GearTrainWorkbench` upgrades on branch `ebtn-upgrades`. First capture a regression baseline: every existing challenge and a set of saved files, run through the current version. Then items 1 to 4, then 5 to 7.
- **Phase 9:** `TrussStressVisualizer` upgrades on branch `ebtn-upgrades`, with the same regression-baseline step, then TV tests. **Final checkpoint.**

## Goal wording for this run

> Execute `/home/billvanloo/GitHub/EngineeredByTheNumbers/PLAN.md`, Phases 0 through 3, starting from the phase recorded in `STATUS.md` (Phase 0 if it does not exist). Follow the Rules for the run and the per-tool Definition of done. Create the curriculum repo and the `ShaftBeamWorkbench` and `MotorDriveMatcher` repos locally in `~/GitHub/` with git, but do not create GitHub remotes or push. Stop at Checkpoint B and report as that section describes.
