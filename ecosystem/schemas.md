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
    { "label": "Drive pulley", "magnitude": 51.4, "angleDeg": 270, "torque": 0.677 }
  ],
  "notes": []
}
```

- `magnitude` is in N and always positive.
- `angleDeg` is the direction in the source drawing: 0° is +x on the source sheet, counterclockwise positive, so 270° points straight down.
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
