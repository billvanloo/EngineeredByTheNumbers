# 09. Truss Stress Visualizer upgrades

Extension spec for the existing tool at https://www.billvanloo.com/util/TrussVisualizer/ (source: https://github.com/billvanloo/TrussStressVisualizer). Supports unit modules 0 and 4, the screw jack buckling extension in module 2, and the optional conveyor stand in module 5. Mockup: `mockups/09-truss-visualizer-upgrades.html`.

## 0. Ground rules for this upgrade

- Read the existing code, README and help first. The tool already solves ideal pin-jointed trusses by the method of joints on a 6-inch span between a pin and a roller, colors tension blue and compression red, scales line thickness by utilization, marks over-limit members, predicts the first member to fail, offers Tester and Moving load cases, an Inspect tool for joint free-body diagrams, determinacy messages with the 2j = m + 3 rule, material presets with per-member force limits, a material budget, PNG and report export, and JSON save and load. Keep all of it.
- Backward compatibility is required. Existing saved files load unchanged. The Tester workflow on the 6-inch span stays the default and gives identical results.
- Buckling is already the planned phase 2. Item 1 below is written to fit that plan; adjust names to match the existing code.
- The tool works in inches for geometry and newtons for force today. Keep that as the default display. Internally, convert consistently (1 in = 25.4 mm).
- Add predict-first mode (file 00 section 4) for a chosen member force, a support reaction and the predicted failure load, with records written to the prediction log (file 07).

## 1. Buckling of compression members

### Requirements

- Member cross-section setting, per material preset and overridable per member: rectangle (b × h), solid circle (d), round tube (outside and inside diameters).
- Section properties: area A; minimum second moment of area I_min (rectangle: b h³/12 about the weaker axis, that is, with h the smaller side; circle: π d⁴/64); radius of gyration r = √(I_min / A).
- Material properties: elastic modulus E and compressive strength (or yield strength) S. Presets ship as placeholders with the existing "calibrate on the tester" note.
- Effective length L_e = K L with K = 1 for pin-jointed truss members (MechaniCalc).
- Slenderness λ = K L / r. Transition slenderness λ_t = √(2π² E / S) (MechaniCalc; MechSimulator).
- Long members (λ ≥ λ_t): Euler critical load P_cr = π² E I_min / (K L)².
- Intermediate members (λ < λ_t): Johnson, σ_cr = S − (S² / (4π² E)) λ², P_cr = σ_cr A.
- Compression limit for each member = the smaller of the material's compression limit and P_cr. Tension limit unchanged.
- Failure prediction and the utilization thickness use the new compression limit. Each compression member's label says whether buckling or crushing governs.
- Inspect a member (new): shows length, A, I_min, r, λ, λ_t, method used, P_cr and the governing limit.
- Help text: Euler applies only to long, slender members; doubling a member's length cuts its buckling load to a quarter; buckling depends on stiffness (E) and shape, not strength (MechaniCalc, Engineering Hulk).

### Tests

| ID | Setup | Expected |
|---|---|---|
| TV-1a | Solver check, SI. Solid circle d = 50 mm, L = 2000 mm, E = 200 GPa, pinned | I = 306,796 mm⁴. r = 12.5 mm. λ = 160. P_cr = 151.4 kN |
| TV-1b | TV-1a with L = 4000 mm | P_cr = 37.8 kN (one quarter) |
| TV-1c | E = 200 GPa, S = 250 MPa | λ_t = 125.7 |
| TV-1d | Square strip 1/8 in × 1/8 in (3.175 mm), L = 2 in, test value E = 3000 MPa (not a material claim) | I_min = 8.47 mm⁴. P_cr = 97.2 N |
| TV-1e | King post truss (TV-6 geometry) with 1/8 in square members, test value E = 3000 MPa, load 100 N | Diagonal members, length 4.243 in (107.8 mm), carry 70.7 N compression against P_cr = 21.6 N. Buckling governs; predicted first failure is a diagonal, at a tester load of about 30.5 N |
| TV-1f | Saved file from the current version, buckling off | Identical results to today |

Note for TV-1e: failure load scales linearly with load for a truss, so the predicted failure load is 100 × 21.6 / 70.7 = 30.5 N.

## 2. Stress view

### Requirements

- Toggle between Force view (today) and Stress view.
- Stress view shows each member's axial stress σ = F / A in MPa (OpenStax College Physics 2e, 5.3), with separate tension and compression strengths per material.
- Utilization in stress view = |σ| / strength (tension or compression as applicable), or buckling utilization from item 1 if smaller capacity.
- Calibration helper: enter a single-member break force from the tester and the member's cross-section; the tool computes the material's strength F_break / A and offers to save it to the preset.

### Tests

| ID | Setup | Expected |
|---|---|---|
| TV-2a | 2000 N on 50 mm² | 40.0 MPa |
| TV-2b | 45 N on a 1/8 in × 1/8 in member (10.08 mm²) | 4.46 MPa |
| TV-2c | Calibration: break at 150 N on 10.08 mm² | Strength 14.9 MPa saved to preset |

## 3. Beam mode

### Requirements

- A separate mode (tab) with one beam on a pin and a roller, point loads, optional overhangs. The math, readouts and tests are the same as file 01 Beam mode (reactions, shear and bending moment diagrams).
- Cross-section options: rectangle and solid circle. Bending stress σ = M c / I; for a rectangle this is 6M / (b h²), for a circle 32M / (π d³).
- This mode is the bridge from truss statics (members carry only axial force) to shafts (members bend). Help text says so, in one paragraph.
- If file 01 is built, share its beam calculation core rather than duplicating it.

### Tests

| ID | Setup | Expected |
|---|---|---|
| TV-3a | File 01 tests SB-1, SB-2, SB-3 | Same expected values |
| TV-3b | M = 75 N·m, rectangle b = 20 mm, h = 40 mm (h vertical) | σ = 14.1 MPa |

## 4. Workspace size and units

### Requirements

- Span setting: Tester (6.00 in, locked, today's default) or Custom span with an editable length.
- Grid options: ½, ¼, ⅛ in, and 5 mm or 10 mm when metric display is on.
- Display units: inches or millimeters for length; newtons or pound-force for force. Conversions exact (1 in = 25.4 mm; 1 lbf = 4.4482216152605 N).
- Custom span unlocks a larger sheet with zoom and pan, so a conveyor stand side frame (about 1 m) can be modeled.
- The 1000 N tester load cell warning applies only in Tester mode.

### Tests

| ID | Setup | Expected |
|---|---|---|
| TV-4a | Tester span shown in mm | 152.4 mm |
| TV-4b | 100 N shown in lbf | 22.5 lbf |
| TV-4c | Custom span 40 in, 8 panels, determinacy rule | 2j = m + 3 check works the same |

## 5. Distributed deck load

### Requirements

- New load case: Uniform deck load, a total load spread evenly over the deck.
- Convert to joint loads by tributary length: each deck joint carries the load on half of each adjacent panel.
- Show the equivalent joint loads as small arrows with values.

### Tests

| ID | Setup | Expected |
|---|---|---|
| TV-5a | 4 equal deck panels, total 400 N | End joints 50 N each, interior joints 100 N each |
| TV-5b | 3 panels of 2, 2 and 2 in, total 300 N | Joint loads 50, 100, 100, 50 N |

## 6. Solver regression case: king post truss

Use in the existing test suite and as a teaching example in help.

Joints: A (0, 0) pin, B (6, 0) roller, C (3, 0) deck center, D (3, 3) apex, in inches. Members: AC, CB, AD, DB, CD (m = 5, j = 4, 2j = m + 3). Tester load P = 100 N down at C.

| Quantity | Expected |
|---|---|
| Reactions at A and B | 50 N up each |
| CD | 100 N tension |
| AD, DB | 70.7 N compression each |
| AC, CB | 50 N tension each |

## 7. Acceptance criteria

- [ ] All TV tests pass in the tool's Node test suite (`dev/test.js`) and in the interface, and the inline copy of the solver matches the tested copy (existing `verify-html.js` pattern).
- [ ] Existing saved files and the default Tester workflow give identical results.
- [ ] Inspect member, Stress view and Beam mode are reachable by keyboard and listed in help.
- [ ] Printable design record includes cross-sections, governing limits and the method (Euler, Johnson or strength) for each compression member.

## 8. Sources

- MechaniCalc, column buckling: https://mechanicalc.com/reference/column-buckling
- MechSimulator, column buckling guide (transition slenderness, Johnson): https://mechsimulator.com/blog/articles/column-buckling-euler-formula-guide/
- Engineering Hulk, column buckling (I = πD⁴/64, 151.4 kN example): https://engineeringhulk.com/mechanical/strength-of-materials/column-buckling/
- OpenStax College Physics 2e, 5.3 Stress and strain: https://openstax.org/books/college-physics-2e/pages/5-3-elasticity-stress-and-strain
- Optimal Beam, simply supported beam: https://optimalbeam.com/engineering-guides/simply-supported-beam
- Existing tool help and README: https://www.billvanloo.com/util/TrussVisualizer/ and https://github.com/billvanloo/TrussStressVisualizer
