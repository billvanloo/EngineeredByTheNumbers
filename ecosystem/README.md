# Ecosystem: shared code and formats

Each Engineered by the Numbers tool is one self-contained `index.html` in its own repository. Code that more than one tool needs is written and tested once, here. It's copied ("vendored") into each tool by `scripts/sync-vendor.js`.

## Which tool reads and writes what

| File | Written by | Read by |
|---|---|---|
| prediction-log | every tool | Prediction Log Collector; any tool's Load button (merges into the student's log) |
| shaft-loads | Gear Train Workbench, Conveyor Designer | Shaft and Beam Workbench |
| drive-request | Gear Train Workbench, Conveyor Designer | Motor and Drive Matcher |
| drive-result | Motor and Drive Matcher | Gear Train Workbench, Conveyor Designer |

The formats are in [`schemas.md`](schemas.md).

## Files

| File | What it is | Vendored into |
|---|---|---|
| `prediction-log.js` | Record builder, percent difference, attempts, JSON and CSV read and write, dedupe (spec 07 Part A) | every tool |
| `schemas.js` | Readers and builders for shaft-loads, drive-request, drive-result and saved design files | every tool |
| `beam-core.js` | Reactions, shear, moment, torque, stress, safety factor, required diameter, deflection (spec 01 §3) | Shaft and Beam Workbench, later Conveyor Designer and Truss Stress Visualizer |
| `motor-core.js` | DC motor line, gearing, load, ratio solver, duty bands, current and efficiency (spec 02 §3) | Motor and Drive Matcher, later Conveyor Designer and Gear Train Workbench |
| `shell/shell.css`, `shell/shell.js` | The shared tool frame: header, footer, themes, help, predict-first, show the working, validation, save and load, PNG export, report, prediction log, settings (spec 00 §2–8) | every new tool |
| `shell/head-snippet.html` | Theme pre-paint script and the inline favicon for each tool's `<head>` | pasted by hand |
| `shell/demo/` | The smallest complete tool built on the shell. It's also the starting template for a new tool | — |
| `tooling/verify-blocks.js` | Checks that a tool's inline code matches its tested copies | every tool's `dev/` |
| `tooling/e2e-kit.js` | Playwright helpers and the standard browser checks every tool runs | every tool's `dev/` |
| `vendor-manifest.json` | Which files go into which tool repo | |

## How vendoring works

A tool's `index.html` holds each shared file between markers:

```
/* BEGIN vendor:shell.js */
...exact contents of ecosystem/shell/shell.js...
/* END vendor:shell.js */
```

The tool repo also keeps the same files in `dev/vendor/`, so its tests run without this repository. The tool's own calculation code is in `dev/core.js` and between `/* BEGIN core */` markers in `index.html`.

- **Change shared code here,** then run `node ecosystem/test/test.js` and `node scripts/sync-vendor.js`. The sync writes `dev/vendor/` and the inline blocks in every tool listed in `vendor-manifest.json` (the sibling repos must be checked out next to this one).
- **Check for drift** with `node scripts/sync-vendor.js --check`, or with each tool's `node dev/verify-html.js`.
- **Never edit** a tool's `dev/vendor/` files or its inline vendor blocks directly. The next sync overwrites them.

## Starting a new tool

1. Copy `shell/demo/` into a new repository and rename it: title, `tool`, `repo`, `slug`.
2. Add the repository to `vendor-manifest.json` with the files it needs, and run `node scripts/sync-vendor.js`.
3. Write `dev/core.js` with its tests first, then the interface. `node dev/verify-html.js --fix` copies the core into `index.html`.
4. Run `dev/test.js`, `dev/verify-html.js` and `dev/e2e.js`. `kit.standard()` covers the shell requirements, and the tool's own e2e adds its spec checks.

## The shell in one paragraph

A tool calls `Shell.create(cfg)`.

- **The config supplies:** `defaultState()`, `build(app)` (creates the input fields once), `render(app)` (runs the model and draws after every change), `drawing(app)` (returns `{ svg, width, height }`, drawn with `app.pal()` colours), `predictTargets(app)`, `inputsSnapshot(app)`, `report(app)` and `help`.
- **The shell handles:** the header and footer, theme and palette, input fields with validation messages, predict-first masking (`app.show(html)`), prediction records, the working panel (`app.setWorking(steps)`), save and load, imports (`cfg.imports[schema]`), the 2× PNG with its caption strip, the printable report, the log dialog, settings, Clear my data and help.
- **What it stores:** state is saved in local storage under `ebtn:<slug>:`. The student's name and theme are shared across tools under `ebtn-name` and `ebtn-theme`.
