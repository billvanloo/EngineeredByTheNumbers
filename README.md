# Engineered by the Numbers

Curriculum materials for the Principles of Engineering unit "Engineered by the Numbers." The unit teaches students to apply the fundamental math and physics of mechanical engineering through a series of example problems. Each problem has a browser tool that lets students predict, run, check and explain.

**[Open the unit plan](https://billvanloo.github.io/EngineeredByTheNumbers/curriculum/engineered-by-the-numbers.html)**, the basis for the whole curriculum.

This repository holds the curriculum side of the project: the unit materials, the specifications for the tools, and the shared file formats and code that connect the tools. Each tool lives in its own repository, works on its own, and is published with GitHub Pages: use the Open links below, or download a tool's `index.html` to use it offline.

## The tools

| Tool | Open it | Repository | Unit module | Status |
|---|---|---|---|---|
| Shaft and Beam Workbench | [Open](https://billvanloo.github.io/ShaftBeamWorkbench/) | [ShaftBeamWorkbench](https://github.com/billvanloo/ShaftBeamWorkbench) | 4, 5 | v1.0.0 |
| Motor and Drive Matcher | [Open](https://billvanloo.github.io/MotorDriveMatcher/) | [MotorDriveMatcher](https://github.com/billvanloo/MotorDriveMatcher) | 1, 5 | v1.0.0 |
| Friction and Screw Lab | [Open](https://billvanloo.github.io/FrictionScrewLab/) | [FrictionScrewLab](https://github.com/billvanloo/FrictionScrewLab) | 2 | v1.0.0 |
| Flywheel Brake Lab | [Open](https://billvanloo.github.io/FlywheelBrakeLab/) | [FlywheelBrakeLab](https://github.com/billvanloo/FlywheelBrakeLab) | 3 | v1.0.0 |
| Conveyor Designer | [Open](https://billvanloo.github.io/ConveyorDesigner/) | [ConveyorDesigner](https://github.com/billvanloo/ConveyorDesigner) | 5 (capstone) | v1.0.0 |
| Units and Formula Checker | [Open](https://billvanloo.github.io/UnitsFormulaChecker/) | [UnitsFormulaChecker](https://github.com/billvanloo/UnitsFormulaChecker) | All | v1.0.0 |
| Prediction Log Collector | [Open](https://billvanloo.github.io/PredictionLogCollector/) | [PredictionLogCollector](https://github.com/billvanloo/PredictionLogCollector) | All (teacher tool) | v1.0.0 |
| Gear Train Workbench | [Open](https://billvanloo.github.io/GearTrainWorkbench/) | [GearTrainWorkbench](https://github.com/billvanloo/GearTrainWorkbench) | 1, 5 | Version 1 published; version 2 (spec 08 upgrades) on a branch for review |
| Truss Stress Visualizer | [Open](https://www.billvanloo.com/util/TrussVisualizer/) | [TrussStressVisualizer](https://github.com/billvanloo/TrussStressVisualizer) | 0, 2, 4, 5 | Existing; upgrades planned |

## How the tools connect

The tools pass work to each other as small JSON files, so no server or accounts are needed. `ecosystem/README.md` has the details.

- Every tool writes the same **prediction log** format, so a teacher can merge a class's logs in the Prediction Log Collector.
- **Shaft loads** go from the Gear Train Workbench and the Conveyor Designer into the Shaft and Beam Workbench.
- **Drive requests** go from the Gear Train Workbench and the Conveyor Designer to the Motor and Drive Matcher, and **drive results** come back.

## Contents

| Path | What it is |
|---|---|
| [Unit plan](https://billvanloo.github.io/EngineeredByTheNumbers/curriculum/engineered-by-the-numbers.html) | The unit plan for "Engineered by the Numbers", the basis for the whole curriculum ([source on GitHub](https://github.com/billvanloo/EngineeredByTheNumbers/blob/main/curriculum/engineered-by-the-numbers.html)) |
| [`curriculum/`](curriculum/) | Unit materials (in progress) |
| [`engineered-by-the-numbers-tool-specs/`](engineered-by-the-numbers-tool-specs/) | Requirements spec for every tool, with mockups |
| [`ecosystem/`](ecosystem/) | Shared file formats, and the canonical copy of code used by more than one tool |
| [`scripts/`](https://github.com/billvanloo/EngineeredByTheNumbers/tree/main/scripts) | Spec value check, vendoring script, and a test runner across all tool repos |
| [`PLAN.md`](PLAN.md), [`STATUS.md`](STATUS.md) | Build plan and progress |
| [`PLAN-REMAINING-TOOLS.md`](PLAN-REMAINING-TOOLS.md) | Detailed plan for tools 03 to 06 and the Collector (Phases 4 to 7) |
| [`ERRATA.md`](ERRATA.md), [`QUESTIONS.md`](QUESTIONS.md) | Spec corrections and open decisions for review |

## Development

```
node scripts/check-spec-values.js     # recompute every spec test value from the spec formulas
node scripts/sync-vendor.js           # copy ecosystem code into each sibling tool repo
scripts/test-all.sh                   # run the ecosystem tests and every tool repo's tests
```

The tool repositories are expected as siblings of this one (for example, `~/GitHub/ShaftBeamWorkbench`).

This was built using Claude. Please don't use these materials if you have qualms about using content created with AI tools.
