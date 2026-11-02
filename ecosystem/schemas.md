# File formats

The tools exchange work as small JSON (and CSV) files. Nothing is sent to a server. The validators are in `schemas.js` and `prediction-log.js`. Every format carries `schema` and `schemaVersion`. A reader accepts older versions and warns about newer ones: it loads the fields it knows and ignores the rest.

## prediction-log (version 1)

Written by every tool on each Check in predict-first mode. Merged by the Prediction Log Collector. The full field list is in spec 07 §3.1. In short:

| Field | Type | Notes |
|---|---|---|
| `schema`, `schemaVersion` | string, integer | `"prediction-log"`, `1` |
| `tool`, `toolVersion` | string | For example `"Shaft and Beam Workbench"`, `"1.0.0"` |
| `student`, `team`, `classPeriod` | string | Blank student becomes `"unnamed"` |
| `problemId` | string | Challenge ID, or `sandbox-` plus a 6-hex-digit hash of the SI inputs |
| `quantity`, `unit` | string | For example `"safety factor n"`, `""` |
| `predicted`, `model`, `measured` | number or null | In the display unit |
| `pctPredVsModel`, `pctMeasVsModel` | number or null | (value − model) ÷ model × 100; null when the model is 0 or missing |
| `attempt` | integer | Per student, problem and quantity, starting at 1 |
| `timestamp` | string | ISO 8601 with offset |
| `inputs` | object | `{ values: {...}, units: {...} }` in SI |
| `note` | string | Student's explanation of a gap |

- **JSON form:** `{ "schema": "prediction-log", "schemaVersion": 1, "records": [ ... ] }`
- **CSV form:** a header row with the field names in the order above, one record per row, RFC 4180 quoting, CRLF line ends, UTF-8 with a byte order mark. `inputs` is compact JSON in one quoted cell.
- **Copy last row:** tab-separated values in the same field order, with no header.

## shaft-loads (version 1)

Written by the Gear Train Workbench (tooth forces) and the Conveyor Designer (pulley side load). Read by the Shaft and Beam Workbench.

```json
{
  "schema": "shaft-loads", "schemaVersion": 1,
  "source": "Conveyor Designer",
  "units": { "force": "N", "torque": "N·m" },
  "loads": [
    { "label": "Drive pulley", "magnitude": 51.4, "angleDeg": 180, "torque": 0.677 }
  ],
  "notes": []
}
```

- `magnitude` is in N and always positive.
- `angleDeg` is the direction in the source drawing: 0° is +x on the source sheet, counterclockwise positive, so 270° points straight down. The Conveyor Designer's side load points along the belt toward the tail, so it is 180° at 180° wrap (QUESTIONS Q22).
- `torque` (N·m, optional) is the torque carried by that element's shaft.
- `plane` (`"front"` or `"back"`) and `shaft` (an ID) are optional and used by the Gear Train Workbench.
- If any two loads point more than 5° apart, the reader flags `multiPlane`, and the Workbench shows the two-plane warning from spec 01 §5.5.

## drive-request (version 1)

Written by the Gear Train Workbench and the Conveyor Designer. Read by the Motor and Drive Matcher.

```json
{
  "schema": "drive-request", "schemaVersion": 1,
  "source": "Conveyor Designer",
  "units": { "torque": "N·m", "speed": "rpm" },
  "loadTorque": 0.677,
  "targetSpeed": 95.5,
  "stages": [ { "ratio": 3.14, "efficiency": 0.9 } ],
  "motor": { "label": "Team motor", "stallTorque": 2, "noLoadSpeed": 300, "count": 1 },
  "note": "Capstone conveyor drive"
}
```

`loadTorque` is required. `targetSpeed` is the wanted output speed. `stages` and `motor` are optional starting values.

## drive-result (version 1)

Written by the Motor and Drive Matcher ("Export drive result"). It is read back by the tool that sent the request.

```json
{
  "schema": "drive-result", "schemaVersion": 1,
  "source": "Motor and Drive Matcher",
  "units": { "torque": "N·m", "speed": "rpm", "power": "W" },
  "motor": { "label": "Example motor (not a real product)", "stallTorque": 2, "noLoadSpeed": 300, "count": 1 },
  "stages": [ { "ratio": 2.70, "efficiency": 0.9 } ],
  "ratio": 2.70, "efficiency": 0.9,
  "loadTorque": 0.68, "targetSpeed": 95.5,
  "ratioRoots": { "high": 2.702, "low": 0.4392 },
  "operatingPoint": { "motorTorque": 0.2798, "motorSpeed": 258.0, "pctStall": 13.99, "outputSpeed": 95.56, "outputTorque": 0.68, "stalled": false },
  "dutyBand": "continuous"
}
```

`dutyBand` is one of `continuous`, `short`, `avoid` or `stalled`.

## Saved design files

Each tool's Save button writes its own design file (spec 00 §6):

```json
{ "tool": "Shaft and Beam Workbench", "toolVersion": "1.0.0", "schemaVersion": 1,
  "savedAt": "2026-09-27T19:03:09.000Z", "student": "A. Student", "state": { ... } }
```

`state` is the tool's full input state, and its shape belongs to each tool. Loading a file from an older `schemaVersion` runs the tool's `migrate()`. Anything that can't be carried forward is named in the load message. The Load button also accepts prediction-log files (it merges them into the student's log) and whatever import formats the tool reads.

## challenge-list (version 1)

Pasted by the teacher into a tool's Settings (Challenges). The same list goes to every student, who pastes it into their copy. It replaces the tool's built-in example challenges. The reader is `Shell.util.readChallengeList`.

```json
{
  "tool": "Friction and Screw Lab", "schemaVersion": 1,
  "challenges": [
    { "id": "FS-M1", "title": "Mystery surface", "brief": "Find μ for the hidden surface.",
      "inputs": { "muS": 0.42, "muK": 0.35 }, "hidden": ["muS", "muK"],
      "tolerance": { "match": 2, "close": 10 }, "requirePrediction": true }
  ]
}
```

- `id` is required and unique. Use the tool's prefix (below).
- `inputs` use the names and units of the tool's saved design file (its `state`). They are applied when the challenge starts.
- `hidden` lists inputs the student can't see. They show as "hidden" in the input box, the drawing and the report.
- `tolerance` sets the Match and Close bands in percent (default 1% and 5%, spec 00 §4.5).
- `requirePrediction`: buttons such as Run, Spin up and Turn wait for a checked prediction (spec 00 §4.6).
- `predictFirst` defaults to true: choosing a challenge turns predict first on (spec 00 §4).
- A bare array of challenges is also accepted. A list made for another tool is refused with a message.

## Conventions for the remaining tools

### Problem IDs

A challenge's `id` is the record's `problemId`. IDs start with the tool's prefix, the same one its spec test cases use: `SB-`, `MD-`, `FS-`, `FB-`, `CD-`, `UF-`, and `WB-` for the Gear Train Workbench (`WB-1.1` … `WB-4.1` for its version 1 challenges, `WB-C1` … `WB-C9` for tier 5). Sandbox work stays `sandbox-<hash>`.

### Prediction quantities

The Collector groups records by `quantity`, so each tool uses these exact names for its predict targets.

| Tool | quantity | unit |
|---|---|---|
| Friction and Screw Lab | `friction coefficient mu` | |
| | `torque to raise T_R` | N·m |
| | `handle force F` | N |
| | `efficiency e` | % |
| | `self-locking` (a yes/no target: 1 yes, 0 no) | yes/no |
| Flywheel Brake Lab | `normal force N` | N |
| | `braking torque T_b` | N·m |
| | `stopping time t` | s |
| | `turns to stop` | turns |
| | `temperature rise upper limit` | °C |
| Conveyor Designer | `belt pull T_e` | N |
| | `belt power P` | W |
| | `pulley speed N_p` | rpm |
| | `minimum slack-side tension T2_min` | N |
| | `shaft side load R` | N |
| | `shaft safety factor n` | |
| Units and Formula Checker | the line's variable name, for example `T` | the line's display unit |
| Gear Train Workbench | `output speed N_out` | rpm |
| | `output torque T_out` | N·cm |
| | `overall efficiency eta` | % |
| | `power lost P_lost` | W |
| | `motor torque T_m` | N·cm |
| | `motor speed N_m` | rpm |
| | `lift speed v` | m/s |
| | `centre distance a` | mm |
| | `tangential force F_t` | N |
| | `radial force F_r` | N |
| | `mesh efficiency eta` (tier 5 WB-C6) | |

### Modules

Prediction records have no module field (QUESTIONS Q27). The Collector's Module filter uses this table, from the spec package README.

| Tool | Unit modules |
|---|---|
| Truss Stress Visualizer | 0, 2, 4, 5 |
| Motor and Drive Matcher | 1, 5 |
| Gear Train Workbench | 1, 5 |
| Friction and Screw Lab | 2 |
| Flywheel Brake Lab | 3 |
| Shaft and Beam Workbench | 4, 5 |
| Conveyor Designer | 5 |
| Units and Formula Checker | all |
