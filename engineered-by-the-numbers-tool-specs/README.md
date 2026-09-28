# Engineered by the Numbers: tool specifications

Handoff package for building the learning tools that support the Principles of Engineering unit "Engineered by the Numbers." Each file is a requirements spec written for Claude Code. The specs describe behavior, math, interactions, outputs and tests. They do not prescribe code structure beyond the shared conventions.

The unit goal: help students learn how to apply the fundamental math and physics of mechanical engineering through a series of example problems. Every tool here exists to make one of those example problems something students can predict, run, check and explain.

## Contents

| File | Tool | Type | Unit module |
|---|---|---|---|
| `00-shared-conventions.md` | Conventions every tool follows | Shared | All |
| `01-shaft-beam-workbench.md` | Shaft and Beam Workbench | New | 4, 5 |
| `02-motor-drive-matcher.md` | Motor and Drive Matcher | New | 1, 5 |
| `03-friction-screw-lab.md` | Friction and Screw Lab | New | 2 |
| `04-flywheel-brake-lab.md` | Flywheel Brake Lab | New | 3 |
| `05-conveyor-designer.md` | Conveyor Designer | New | 5 (capstone) |
| `06-units-formula-checker.md` | Units and Formula Checker | New | All (supplements S1, S2) |
| `07-prediction-log.md` | Prediction Log format and Collector | New | All |
| `08-gear-train-workbench-upgrades.md` | Gear Train Workbench upgrades | Extension | 1, 5 |
| `09-truss-visualizer-upgrades.md` | Truss Stress Visualizer upgrades | Extension | 0, 2, 4, 5 |
| `mockups/*.html` | Static layout mockups, one per tool | Reference | |
| `screenshots/*.png` | Renders of the mockups | Reference | |

## Suggested build order

1. `07-prediction-log.md`, the shared record format only (section 3). Every other tool writes it, so fix it first.
2. `01-shaft-beam-workbench.md`. Hardest module in the unit, and it consumes exports from the Gear Train Workbench and the Conveyor Designer.
3. `02-motor-drive-matcher.md`. The capstone depends on it, and its model is reused inside `05` and `08`.
4. `08-gear-train-workbench-upgrades.md`, items 1 to 4 first.
5. `03`, `04`, `05`, `09`, `06`, then the Collector half of `07`.

## How to use these specs with Claude Code

- Give Claude Code `00-shared-conventions.md` plus one tool spec at a time.
- For the two existing tools, point Claude Code at the existing repository and the matching upgrade spec. Tell it to read the current code first and keep existing behavior, saves and challenges working unchanged.
- Treat every test case table as a required automated test for the tool's calculation core, plus a manual UI check. Expected values were computed independently and cross-checked against the cited sources and the unit page's worked examples.
- Mockups show layout and content only. Visual styling should match the existing tools (drafting-paper light theme, blueprint dark theme).

## Existing tools referenced

- Gear Train Workbench: https://billvanloo.github.io/GearTrainWorkbench/ (source: https://github.com/billvanloo/GearTrainWorkbench)
- Truss Stress Visualizer: https://www.billvanloo.com/util/TrussVisualizer/ (source: https://github.com/billvanloo/TrussStressVisualizer)
- Unit plan page, including prototype interactives for tools 01 to 05: the published "Engineered by the Numbers" unit plan page.
