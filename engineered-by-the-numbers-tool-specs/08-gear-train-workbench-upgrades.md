# 08. Gear Train Workbench upgrades

Extension spec for the existing tool at https://billvanloo.github.io/GearTrainWorkbench/ (source: https://github.com/billvanloo/GearTrainWorkbench). Supports unit modules 1 and 5. Mockup: `mockups/08-gear-train-workbench-upgrades.html`.

## 0. Ground rules for this upgrade

- Read the existing code and help first. Where the Workbench already does something described here, keep the existing behavior and skip or merge that part of the spec.
- Backward compatibility is required. Existing challenges, saved files, progress in local storage, keyboard controls, the two-plane rule, compound stacking, the Show the working panel, exports and themes must behave exactly as today with default settings.
- New features default to off or to values that reproduce today's results (efficiency 1.00, fixed motor speed). They appear behind an Advanced switch or a new challenge tier, following the tool's existing tier system.
- Keep torque in N·cm in the main readout to match today's interface. Offer N·m as a display option.
- Add each new output to predict-first mode and to the prediction log (file 07).

The current Workbench builds simple, idler and compound trains, drives them with a motor at a set speed and torque, and reports overall ratio, output speed, output torque and direction for an ideal train where power in equals power out. These upgrades extend that model.

## 1. Mesh efficiency

### Requirements

- Each mesh has an efficiency η from 0.30 to 1.00, default 1.00. A global "same efficiency for every mesh" setting fills all meshes at once.
- Output torque = input torque × overall ratio × product of mesh efficiencies. Output speed is unchanged by efficiency.
- New readouts: overall efficiency, power in, power out, power lost (W).
- Show the working: one line per mesh with its ratio and efficiency, then the product.
- Mesh efficiency can be marked "hidden" in a challenge (see item 7, WB-C6).

### Tests

| ID | Setup | Expected |
|---|---|---|
| WB-1a | Existing sample train, all η = 1.00 | Identical readouts to the current version |
| WB-1b | 12T drives 36T, compound to 12T drives 36T. Motor 300 rpm, 50 N·cm. η = 0.95 per mesh | Ratio 9. Output 33.3 rpm. Ideal output 450 N·cm. With efficiency 406 N·cm. Power in 15.7 W, out 14.2 W, lost 1.53 W. Overall efficiency 90.25% |

## 2. Motor curve

### Requirements

- Motor mode: Fixed (today's behavior, default) or DC motor.
- DC motor mode inputs: stall torque (N·cm) and no-load speed (rpm). Model and math exactly as file 02, sections 3.1 and 3.2.
- The Load tool gains a load torque value (N·cm) at the output shaft.
- The motor turns at its operating point: N_m = N₀ (1 − T_m / T_s), T_m = T_L / (i η). If T_m ≥ T_s the train stalls: gears stop, readout says "Stalled" with the reason.
- A small inset plot shows the motor line, the operating point and duty bands (file 02, section 3.4).
- The animation speed follows the operating point speed.

### Tests

| ID | Setup | Expected |
|---|---|---|
| WB-2a | DC motor T_s = 200 N·cm, N₀ = 300 rpm. 14T drives 44T (ratio 3.143), η = 0.90. Load 68 N·cm | Motor torque 24.0 N·cm (12.0% of stall). Motor speed 264 rpm. Output 84.0 rpm |
| WB-2b | WB-2a with load 700 N·cm | Stalled |
| WB-2c | Fixed mode, any train | Identical to current behavior |

## 3. Gear geometry and hole layout export

### Requirements

- Each gear size in the palette has a module setting (default taken from the Workbench's current gear catalog if it defines one; otherwise teacher-set, default 1 mm). Gears only mesh when they share a module; a mismatch shows "These gears have different tooth sizes (module) and cannot mesh."
- Readouts per gear: pitch diameter d = z m. Per mesh: center distance a = m (z₁ + z₂) / 2 (KHK Gears).
- Pressure angle setting per train: 20° default, 14.5° option (KHK Gears notes 20° is now usual).
- Export gear plate (SVG): shaft centers at true scale in mm, one circle per shaft with a user-set hole diameter, center crosshairs, an optional outline rectangle with a margin, and labels on a separate layer. Follow the stroke and color conventions used by the teacher's ULS Laser Ready utility (https://billvanloo.com/util/laser-ready.html); let the teacher set cut color and stroke width. Include a 10 mm scale bar on the label layer so print scale can be checked.
- Front and back planes share shaft positions, so the plate shows each shaft once.

### Tests

| ID | Setup | Expected |
|---|---|---|
| WB-3a | 12T and 36T, module 2 | d = 24 mm and 72 mm. a = 48.0 mm |
| WB-3b | 17T and 34T, module 1 | a = 25.5 mm (KHK worked example) |
| WB-3c | Module 1 gear dragged onto module 2 gear | No mesh, message shown |
| WB-3d | SVG export of WB-3a, hole 5 mm | Two circles 5 mm diameter, centers 48.0 mm apart when opened in a vector editor at 100% |

## 4. Tooth forces and shaft-load export

### Requirements

- For each mesh, using the torque on the driving gear's shaft at that mesh: tangential force F_t = 2T / d, radial force F_r = F_t tan α, resultant F_t / cos α (Drivetrain Hub; spur gears have no axial force).
- Directions come from the sheet geometry. F_r acts along the line of centers, pushing the gears apart. F_t acts perpendicular to the line of centers, in the direction set by rotation. Each gear receives an equal and opposite force from its mate.
- Draw force arrows on each gear when a Forces toggle is on, labeled with values.
- Export shaft loads (JSON, schema in file 01 section 7): one entry per shaft listing each force on it with magnitude, angle on the sheet, plane (front or back) and the torque carried by that shaft.
- If two forces on one shaft point in directions more than 5° apart, add a note to the export that a two-plane shaft analysis is needed.

### Tests

| ID | Setup | Expected |
|---|---|---|
| WB-4a | 12T module 2 driver, 50 N·cm on its shaft, meshing with 36T | F_t = 41.7 N. F_r = 15.2 N. Resultant 44.3 N |
| WB-4b | WB-4a with gears placed with line of centers horizontal, driver on the left, driver clockwise | Force on the driven gear: F_r pointing right (away from driver). F_t direction consistent with clockwise driver pushing the driven gear counterclockwise. Equal and opposite force on the driver |
| WB-4c | Export WB-4a and import into the Shaft and Beam Workbench | Loads and torque match; no two-plane warning for a single mesh |

## 5. Lift task on the Load tool

### Requirements

- Load tool option: Spool. Inputs spool radius (mm) and hanging mass (kg).
- Required output torque T_L = m g r, with g = 9.81 m/s². Lift speed v = ω_out r. Lifting power m g v.
- In Fixed motor mode, flag when the ideal output torque from the motor setting is below T_L ("the motor setting cannot lift this load"). In DC motor mode, use the operating point.
- Animate the mass rising at v (scaled).

### Tests

| ID | Setup | Expected |
|---|---|---|
| WB-5a | 5 kg on a 20 mm spool | T_L = 98.1 N·cm |
| WB-5b | WB-5a with output at 100 rpm | v = 0.209 m/s. Lifting power 10.3 W |

## 6. Belt and chain stages

### Requirements

- New parts: pulleys and sprockets (by diameter or tooth count for timing pulleys and sprockets). A Belt tool links two pulleys or two sprockets on the same plane.
- Belted pulleys turn the same direction. A crossed belt option reverses direction. Ratio = driven size ÷ driver size (diameters, or teeth for timing pulleys and sprockets).
- Belt and chain stages take part in overall ratio, efficiency (item 1) and show the working. The two-plane rule applies: a belt connects parts on the same plane.
- Tooth forces (item 4) do not apply to belts. The shaft-load export for belt stages is out of scope here; the Conveyor Designer handles belt tensions.

### Tests

| ID | Setup | Expected |
|---|---|---|
| WB-6a | 20T timing pulley driving 40T timing pulley | Ratio 2, same direction |
| WB-6b | 12T drives 36T gear, 36T compound with 20T pulley, belt to 40T pulley | Overall ratio 6 |
| WB-6c | WB-6a with crossed belt | Ratio 2, opposite direction |

## 7. Challenge pack for the unit

Add as a new tier. Each challenge lists allowed parts, the brief, and pass conditions. Predict first is on.

| ID | Brief | Pass condition |
|---|---|---|
| WB-C1 | Make the output turn the same direction as the input using only spur gears | Direction matches input; at least one idler |
| WB-C2 | Exact 3 : 1 reduction with two gears | Ratio 3.000 |
| WB-C3 | 12 : 1 reduction in two stages | Ratio 12.000, exactly two meshes |
| WB-C4 | Conveyor reducer: fixed motor at 300 rpm, output 95 rpm within 5% | Output 90.25 to 99.75 rpm (ratio 3.008 to 3.324) |
| WB-C5 | Loaded conveyor drive: DC motor 200 N·cm stall, 300 rpm no-load, load 68 N·cm, 0.90 per mesh, output 95.5 rpm within 5% | Operating point output 90.7 to 100.3 rpm, motor below 30% of stall |
| WB-C6 | Hidden efficiency: the teacher hides a mesh efficiency. Students are told the measured output torque and must find η | Student's entered η within 0.01 of hidden value |
| WB-C7 | Lift 5 kg on a 20 mm spool with the DC motor from WB-C5 without going above 30% of stall | Motor torque ≤ 60 N·cm, not stalled |
| WB-C8 | Gear plate: build a 3 : 1 pair in module 2 and export the plate | a = 48.0 mm in the export |
| WB-C9 | Predict tooth forces for a given pinion torque before turning Forces on | Prediction logged; within 5% counts as a match |

## 8. Acceptance criteria

- [ ] Every existing challenge and saved file behaves identically with default settings (regression test using saved files from the current version).
- [ ] All WB tests pass in the tool's Node test suite and in the interface.
- [ ] New readouts appear in Show the working, predict-first mode and the report export.
- [ ] Keyboard access for every new tool and setting, added to the help panel's key list.

## 9. Sources

- KHK Gears, basic gear terminology and calculation: https://khkgears.net/new/gear_knowledge/abcs_of_gears-b/basic_gear_terminology_calculation.html
- KHK Gears, center distance: https://khkgears.net/new/gear_knowledge/gear-nomenclature/center-distance.html
- KHK Gears, design shapes of spur gears (17T and 34T example): https://khkgears.net/new/gear_knowledge/gear-design-procedure-in-practical-design/design-shapes-of-spur-gears.html
- Drivetrain Hub, gear force analysis: https://drivetrainhub.com/notebooks/gears/strength/Chapter%201%20-%20Force%20Analysis.html
- File 02 of this package for the motor model and duty bands
