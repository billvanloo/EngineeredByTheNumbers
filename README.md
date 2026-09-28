# Engineered by the Numbers

Curriculum materials for the Principles of Engineering unit "Engineered by the Numbers." The unit teaches students to apply the fundamental math and physics of mechanical engineering through a series of example problems. Each problem has a browser tool that lets students predict, run, check and explain.

This repository holds the curriculum side of the project: the unit materials, the specifications for the tools, and the shared file formats and code that connect the tools. Each tool lives in its own repository and works on its own.

## The tools

| Tool | Repository | Unit module | Status |
|---|---|---|---|
| Shaft and Beam Workbench | [ShaftBeamWorkbench](https://github.com/billvanloo/ShaftBeamWorkbench) | 4, 5 | v1.0.0 built, not yet published |
| Motor and Drive Matcher | [MotorDriveMatcher](https://github.com/billvanloo/MotorDriveMatcher) | 1, 5 | v1.0.0 built, not yet published |
| Friction and Screw Lab | FrictionScrewLab | 2 | Planned |
| Flywheel Brake Lab | FlywheelBrakeLab | 3 | Planned |
| Conveyor Designer | ConveyorDesigner | 5 (capstone) | Planned |
| Units and Formula Checker | UnitsFormulaChecker | All | Planned |
| Prediction Log Collector | PredictionLogCollector | All | Planned |
| Gear Train Workbench | [GearTrainWorkbench](https://github.com/billvanloo/GearTrainWorkbench) | 1, 5 | Existing; upgrades planned |
| Truss Stress Visualizer | [TrussStressVisualizer](https://github.com/billvanloo/TrussStressVisualizer) | 0, 2, 4, 5 | Existing; upgrades planned |

## How the tools connect

The tools pass work to each other as small JSON files, so no server or accounts are needed. `ecosystem/README.md` has the details.

- Every tool writes the same **prediction log** format, so a teacher can merge a class's logs in the Prediction Log Collector.
- **Shaft loads** go from the Gear Train Workbench and the Conveyor Designer into the Shaft and Beam Workbench.
- **Drive requests** go from the Gear Train Workbench and the Conveyor Designer to the Motor and Drive Matcher, and **drive results** come back.

## Contents

| Path | What it is |
|---|---|
| `curriculum/` | Unit materials (in progress) |
| `engineered-by-the-numbers-tool-specs/` | Requirements spec for every tool, with mockups |
| `ecosystem/` | Shared file formats, and the canonical copy of code used by more than one tool |
| `scripts/` | Spec value check, vendoring script, and a test runner across all tool repos |
| `PLAN.md`, `STATUS.md` | Build plan and progress |
| `ERRATA.md`, `QUESTIONS.md` | Spec corrections and open decisions for review |

## Development

```
node scripts/check-spec-values.js     # recompute every spec test value from the spec formulas
node scripts/sync-vendor.js           # copy ecosystem code into each sibling tool repo
scripts/test-all.sh                   # run the ecosystem tests and every tool repo's tests
```

The tool repositories are expected as siblings of this one (for example, `~/GitHub/ShaftBeamWorkbench`).

This was built using Claude. Please don't use these materials if you have qualms about using content created with AI tools.
