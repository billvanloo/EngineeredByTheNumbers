# Open questions

Decisions the specs leave open, formulas a tool needed that the spec doesn't give, and anything else for the teacher to confirm. Each entry says what the build did in the meantime, so nothing is blocked.

| # | Where | Question | What the build does for now |
|---|---|---|---|
| Q1 | 00 §1 | The small-screen rule says "show a notice … matching the Gear Train Workbench's current behavior." The Workbench has no on-screen notice today. It only says in help that phones are too small. | A dismissible banner appears below 768 px: "This tool needs a larger screen (at least 1024 px wide) for full use. Readouts still work here." The layout stays usable and readouts stay readable. |
| Q2 | 00 §2 | The Truss Stress Visualizer has only the light theme. The Gear Train Workbench has both light and blueprint. | The palette is copied from the Gear Train Workbench (both themes), with the same token names so the tools look alike. |
| Q3 | 01 §3.3 vs §4 | The default torque output station is "the heaviest load station" in §3.3, but "L/2" in the §4 table. These are the same for the default single load at L/2. | Output defaults to the heaviest load's station, or L/2 when there are no loads. After that it's whatever the student sets. |
| Q4 | 01 §4, 00 §9 | The Sy preset list must ship as placeholders for the teacher to replace. | Presets are "Placeholder steel (400 MPa)", "Placeholder aluminum (250 MPa)", "Placeholder brass (200 MPa)" and "Custom". Every one is flagged "placeholder value in use" in the readout. **Teacher to supply datasheet values.** |
| Q5 | 02 §5.5 | "Accept a drive-request … return a drive-result." Without a server, "return" has to be a file. | The Motor and Drive Matcher loads a `drive-request` JSON (Load menu, or dropped on the page) and offers "Export drive result" as a JSON download. The Workbench and Conveyor Designer will import that file. |
| Q6 | 02 §5.1 | The teacher-editable motor list is "JSON in settings." | The settings dialog has a text area holding the list as JSON, which is validated and saved in local storage. Export and import let a teacher share the list with a class. |
