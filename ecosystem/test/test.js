// Unit tests for the ecosystem modules. Run: node ecosystem/test/test.js
'use strict';
const path = require('path');
const fs = require('fs');
const PL = require('../prediction-log.js');
const Schemas = require('../schemas.js');

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (detail ? ': ' + detail : '')); }
}
// 00 §10: 0.5% relative, or 0.01 absolute for values under 1.
function near(name, got, exp) {
  const good = typeof got === 'number' && isFinite(got) &&
    (Math.abs(exp) < 1 ? Math.abs(got - exp) <= 0.01 : Math.abs(got - exp) / Math.abs(exp) <= 0.005);
  ok(name, good, 'got ' + got + ', expected ' + exp);
}
function throws(name, fn, re) {
  try { fn(); ok(name, false, 'did not throw'); }
  catch (e) { ok(name, re.test(e.message), 'message was: ' + e.message); }
}
const rec = o => PL.makeRecord(Object.assign({ tool: 'Test Tool', toolVersion: '1.0.0', student: 'A', problemId: 'p1', quantity: 'q', unit: 'N', attempt: 1 }, o));

console.log('Prediction log: percent difference (PL-1 to PL-4)');
near('PL-1 predicted 3.8, model 4.10', rec({ predicted: 3.8, model: 4.10 }).pctPredVsModel, -7.32);
near('PL-2 predicted 22, model 22.56', rec({ predicted: 22, model: 22.56 }).pctPredVsModel, -2.48);
near('PL-3 predicted 95, model 84.05', rec({ predicted: 95, model: 84.05 }).pctPredVsModel, 13.0);
ok('PL-4 model 0 gives null', rec({ predicted: 5, model: 0 }).pctPredVsModel === null);
ok('PL-4 model null gives null', rec({ predicted: 5, model: null }).pctPredVsModel === null);
ok('pctMeasVsModel null when measured missing', rec({ predicted: 5, model: 4 }).pctMeasVsModel === null);
near('pctMeasVsModel computed', rec({ predicted: 5, model: 4, measured: 3 }).pctMeasVsModel, -25);

console.log('Prediction log: record fields');
{
  const r = rec({ student: '  ', predicted: 1, model: 2 });
  ok('blank student becomes "unnamed"', r.student === 'unnamed');
  ok('schema and version set', r.schema === 'prediction-log' && r.schemaVersion === 1);
  ok('every field present', PL.FIELDS.every(f => f in r));
  ok('timestamp has an offset', /T\d\d:\d\d:\d\d[+-]\d\d:\d\d$/.test(r.timestamp));
  const a = PL.annotate(r, { measured: 1.5, note: 'friction' });
  near('annotate recomputes pctMeasVsModel', a.pctMeasVsModel, -25);
  ok('annotate keeps the original untouched', r.measured === null);
}

console.log('Prediction log: attempts');
{
  const list = [rec({ attempt: 1 }), rec({ attempt: 2 }), rec({ attempt: 1, quantity: 'other' })];
  ok('next attempt counts per student/problem/quantity', PL.nextAttempt(list, 'A', 'p1', 'q') === 3);
  ok('new quantity starts at 1', PL.nextAttempt(list, 'A', 'p1', 'new') === 1);
  const m = { student: 'A', problemId: 'p1', quantity: 'q' };
  const al = PL.annotateLatest(list, m, { measured: 3 });
  ok('annotateLatest changes only the latest matching record', al.index === 1 && al.records[1].measured === 3 && al.records[0].measured === null && list[1].measured === null);
  ok('annotateLatest finds nothing for another problem', PL.annotateLatest(list, Object.assign({}, m, { problemId: 'p9' }), { measured: 3 }).index === -1);
  ok('annotateLatest respects the tool when given', PL.annotateLatest(list, Object.assign({ tool: 'Other Tool' }, m), { measured: 3 }).index === -1);
  ok('makeRecord keeps a measured value given at Check', rec({ predicted: 2, model: 2.5, measured: 2.4 }).measured === 2.4 && Math.abs(rec({ predicted: 2, model: 2.5, measured: 2.4 }).pctMeasVsModel + 4) < 1e-9);
  ok('sandbox ID is stable under key order', PL.sandboxProblemId({ a: 1, b: 2 }) === PL.sandboxProblemId({ b: 2, a: 1 }));
  ok('sandbox ID changes with inputs', PL.sandboxProblemId({ a: 1 }) !== PL.sandboxProblemId({ a: 2 }));
}

console.log('Prediction log: CSV round trip (PL-5)');
{
  const name = 'O\'Brien, Ana "AJ"';
  const r = rec({ student: name, predicted: 3.8, model: 4.1, note: 'line one\nline two, with comma', inputs: { values: { L: 0.3 }, units: { L: 'm' } } });
  const csv = PL.toCSV([r]);
  ok('CSV starts with a byte order mark', csv.charCodeAt(0) === 0xFEFF);
  ok('CSV uses CRLF', csv.indexOf('\r\n') > 0);
  const back = PL.fromCSV(csv).records[0];
  ok('PL-5 name round-trips exactly', back.student === name, JSON.stringify(back.student));
  ok('note with line break round-trips', back.note === r.note);
  ok('inputs JSON round-trips', back.inputs.values.L === 0.3 && back.inputs.units.L === 'm');
  ok('numbers round-trip', back.predicted === 3.8 && back.model === 4.1 && back.measured === null);
  ok('parseFile picks CSV by content', PL.parseFile('log.csv', csv).records.length === 1);
}

console.log('Prediction log: JSON forms and warnings (PL-7, PL-8)');
{
  const r = rec({ predicted: 1, model: 2 });
  const j = JSON.stringify(PL.toJSON([r]));
  ok('JSON round trip', PL.fromJSON(j).records[0].predicted === 1);
  const newer = JSON.stringify({ schema: 'prediction-log', schemaVersion: 2, records: [Object.assign({}, r, { schemaVersion: 2, futureField: 7 })] });
  const res = PL.fromJSON(newer);
  ok('PL-7 newer version warns', res.warnings.indexOf('made by a newer tool version; some fields may be ignored') >= 0, JSON.stringify(res.warnings));
  ok('PL-7 known fields still load', res.records.length === 1 && res.records[0].predicted === 1 && !('futureField' in res.records[0]));
  throws('PL-8 malformed JSON gives a reason', () => PL.parseFile('bad.json', '{"records": [ nope'), /not valid JSON/);
  throws('wrong schema is rejected', () => PL.fromJSON('{"schema":"shaft-loads","records":[]}'), /shaft-loads/);
  throws('CSV without needed columns is rejected', () => PL.fromCSV('a,b\n1,2\n'), /student/);
}

console.log('Prediction log: dedupe (PL-6 at module level)');
{
  const list = [rec({ predicted: 1, model: 2, timestamp: 't1' }), rec({ predicted: 1, model: 2, timestamp: 't2' })];
  const twice = list.concat(JSON.parse(JSON.stringify(list)));
  const d = PL.dedupe(twice);
  ok('same file twice keeps the count', d.records.length === 2);
  ok('reports the number removed', d.removed === 2);
}

console.log('Prediction log: tab-separated row');
{
  const row = PL.toTSVRow(rec({ predicted: 1, model: 2, note: 'a\tb\nc' }));
  ok('one line, field count matches', row.indexOf('\n') < 0 && row.split('\t').length === PL.FIELDS.length);
}

console.log('Schemas: shaft-loads');
{
  const f = Schemas.makeShaftLoads('Conveyor Designer', [{ label: 'Pulley', magnitude: 51.4, angleDeg: 270, torque: 0.677 }]);
  const r = Schemas.readShaftLoads(JSON.stringify(f));
  ok('round trip', r.value.loads[0].magnitude === 51.4 && r.value.loads[0].torque === 0.677);
  ok('single load has no plane warning', r.multiPlane === false);
  const two = Schemas.makeShaftLoads('Gear Train Workbench', [{ label: 'a', magnitude: 10, angleDeg: 0 }, { label: 'b', magnitude: 10, angleDeg: 90 }]);
  ok('SB-15 loads at 0° and 90° flag two planes', Schemas.readShaftLoads(two).multiPlane === true);
  const close = Schemas.makeShaftLoads('x', [{ label: 'a', magnitude: 1, angleDeg: 358 }, { label: 'b', magnitude: 1, angleDeg: 2 }]);
  ok('4° apart across 0° is one plane', Schemas.readShaftLoads(close).multiPlane === false);
  throws('negative magnitude rejected', () => Schemas.readShaftLoads({ schema: 'shaft-loads', schemaVersion: 1, loads: [{ magnitude: -1 }] }), /negative/);
  throws('wrong schema rejected', () => Schemas.readShaftLoads({ schema: 'drive-request', schemaVersion: 1 }), /not a shaft-loads/);
  throws('lbf rejected', () => Schemas.readShaftLoads({ schema: 'shaft-loads', schemaVersion: 1, units: { force: 'lbf' }, loads: [{ magnitude: 1 }] }), /lbf/);
  ok('newer version warns', Schemas.readShaftLoads({ schema: 'shaft-loads', schemaVersion: 3, loads: [{ magnitude: 1 }] }).warnings.length === 1);
}

console.log('Schemas: drive request and result');
{
  const req = Schemas.makeDriveRequest('Conveyor Designer', { loadTorque: 0.677, targetSpeed: 95.5, stages: [{ ratio: 3.14, efficiency: 0.9 }] });
  const r = Schemas.readDriveRequest(JSON.stringify(req));
  ok('request round trip', r.value.loadTorque === 0.677 && r.value.targetSpeed === 95.5 && r.value.stages[0].ratio === 3.14);
  throws('negative load rejected', () => Schemas.readDriveRequest({ schema: 'drive-request', schemaVersion: 1, loadTorque: -1 }), /load torque/);
  throws('bad efficiency rejected', () => Schemas.readDriveRequest({ schema: 'drive-request', schemaVersion: 1, loadTorque: 1, stages: [{ ratio: 2, efficiency: 1.5 }] }), /efficiency/);
  const res = Schemas.makeDriveResult('Motor and Drive Matcher', { motor: { stallTorque: 2, noLoadSpeed: 300, count: 1 }, stages: [{ ratio: 2.7, efficiency: 0.9 }], ratio: 2.7, efficiency: 0.9, loadTorque: 0.68, targetSpeed: 95.5, operatingPoint: { outputSpeed: 95.5 }, dutyBand: 'continuous' });
  ok('result round trip', Schemas.readDriveResult(JSON.stringify(res)).value.ratio === 2.7);
}

console.log('Schemas: design file envelope');
{
  const f = Schemas.makeDesignFile({ tool: 'T', toolVersion: '1.0.0', schemaVersion: 2 }, { x: 1 });
  ok('has required fields', ['tool', 'toolVersion', 'schemaVersion', 'savedAt', 'state'].every(k => k in f));
  ok('reads back', Schemas.readDesignFile(JSON.stringify(f), { tool: 'T', schemaVersion: 2 }).value.state.x === 1);
  throws('other tool rejected', () => Schemas.readDesignFile(JSON.stringify(f), { tool: 'U', schemaVersion: 2 }), /saved from the T/);
  const old = Schemas.makeDesignFile({ tool: 'T', toolVersion: '0.9', schemaVersion: 1 }, { x: 1, gone: 2 });
  const m = Schemas.readDesignFile(old, { tool: 'T', schemaVersion: 2, migrate: (v, s) => ({ state: { x: s.x, y: 0 }, dropped: ['gone'] }) });
  ok('older file migrates', m.value.state.y === 0 && /gone/.test(m.warnings[0]));
  ok('newer file warns', Schemas.readDesignFile(Object.assign({}, f, { schemaVersion: 5 }), { tool: 'T', schemaVersion: 2 }).warnings.length === 1);
  throws('prediction log is not a design', () => Schemas.readDesignFile({ schema: 'prediction-log', records: [] }, { tool: 'T', schemaVersion: 1 }), /prediction-log/);
  ok('kindOf', Schemas.kindOf(JSON.stringify(f)) === 'design' && Schemas.kindOf('{"schema":"drive-request"}') === 'drive-request' && Schemas.kindOf('nope') === null);
}

// Further module suites live beside this file (beam-core, motor-core, shell-logic).
for (const f of fs.readdirSync(__dirname).filter(f => /^test-.*\.js$/.test(f)).sort()) {
  const r = require(path.join(__dirname, f));
  passed += r.passed; failed += r.failed;
}

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exitCode = failed ? 1 : 0;
