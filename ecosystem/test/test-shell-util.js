// Pure helpers in ecosystem/shell/shell.js. Loaded by test.js.
'use strict';
const Shell = require('../shell/shell.js');
const U = Shell.util;
let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (detail ? ': ' + detail : '')); }
}
const is = (name, got, exp) => ok(name, got === exp, 'got ' + JSON.stringify(got) + ', expected ' + JSON.stringify(exp));

console.log('Shell: significant figures (00 §3)');
is('4.097 → 4.10', U.fmtSig(4.0971, 3), '4.10');
is('75 → 75.0', U.fmtSig(75, 3), '75.0');
is('0.35806 → 0.358', U.fmtSig(0.35806, 3), '0.358');
is('15.747 → 15.7', U.fmtSig(15.747, 3), '15.7');
is('4 s.f. 15.747 → 15.75', U.fmtSig(15.747, 4), '15.75');
is('99.96 → 100', U.fmtSig(99.96, 3), '100');
is('20000 → 20,000', U.fmtSig(20000, 3), '20,000');
is('−25 uses a minus sign', U.fmtSig(-25, 3), '−25.0');
is('0 → 0', U.fmtSig(0, 3), '0');
is('−0 → 0', U.fmtSig(-0, 3), '0');
is('NaN never shown', U.fmtSig(NaN, 3), '—');
is('Infinity never shown', U.fmtSig(Infinity, 3), '—');
is('tiny uses × 10', U.fmtSig(0.0000123, 3), '1.23 × 10⁻⁵');
is('0.0123 plain', U.fmtSig(0.0123, 3), '0.0123');
is('percent sign', U.fmtPct(-7.317, 3), '−7.32%');
is('percent plus', U.fmtPct(13.03, 3), '+13.0%');
is('percent null', U.fmtPct(null, 3), 'not defined');
is('input format', U.fmtInput(15.915494309), '15.9155');

console.log('Shell: number parsing');
is('plain', U.parseNumber('300'), 300);
is('grouped', U.parseNumber('20,000'), 20000);
is('unicode minus', U.parseNumber('−3.5'), -3.5);
is('leading dot', U.parseNumber('.5'), 0.5);
ok('text rejected', isNaN(U.parseNumber('12a')));
ok('empty rejected', isNaN(U.parseNumber('')));

console.log('Shell: field messages (00 §8)');
is('SB-13 diameter', U.validateNumber('0', { name: 'Diameter', unit: 'mm', gt: 0, max: 500 }).error, 'Diameter must be greater than 0 mm.');
is('SB-13 span', U.validateNumber('0', { name: 'Span', unit: 'mm', gt: 0, min: 20, max: 3000 }).error, 'Span must be greater than 0 mm.');
is('range', U.validateNumber('5000', { name: 'Span', unit: 'mm', min: 20, max: 3000 }).error, 'Span must be between 20 and 3000 mm.');
is('empty', U.validateNumber('', { name: 'Span', unit: 'mm' }).error, 'Enter a value for span.');
is('not a number', U.validateNumber('abc', { name: 'Span' }).error, 'Span must be a number.');
is('custom check', U.validateNumber('5', { name: 'Pitch', check: v => v > 4 ? 'Pitch must be smaller than the diameter.' : null }).error, 'Pitch must be smaller than the diameter.');
is('whole number', U.validateNumber('1.5', { name: 'Motors', integer: true }).error, 'Motors must be a whole number.');
is('valid', U.validateNumber('20', { name: 'Diameter', gt: 0 }).error, null);

console.log('Shell: file names (00 §6)');
is('pattern', U.exportName({ student: 'Ana O\'Brien', tool: 'shaft-beam-workbench', context: 'sandbox', dateISO: '2026-09-27', ext: 'png' }), 'Ana-O-Brien_shaft-beam-workbench_sandbox_2026-09-27.png');
is('blank name', U.exportName({ student: '  ', tool: 't', context: 'SB 6', dateISO: '2026-09-27', ext: 'json' }), 'unnamed_t_SB-6_2026-09-27.json');
is('slashes', U.exportName({ student: 'a/b\\c:d', tool: 't', dateISO: 'x' }), 'a-b-c-d_t_sandbox_x');

console.log('Shell: prediction verdicts and message (00 §4)');
is('1% match', U.verdictFor(-0.9), 'match');
is('5% close', U.verdictFor(4.9), 'close');
is('off', U.verdictFor(-7.3), 'off');
is('not defined', U.verdictFor(null), null);
is('message', U.predictionMessage(3.8, 4.0971, '', 3), 'You predicted 3.80. The model gives 4.10 (−7.25% difference).');
is('message with unit', U.predictionMessage(80, 75, 'N·m', 3), 'You predicted 80.0 N·m. The model gives 75.0 N·m (+6.67% difference).');
is('model zero', U.predictionMessage(1, 0, 'N', 3), 'You predicted 1.00 N. The model gives 0 N (difference not defined: the model value is 0).');
is('model undefined', U.predictionMessage(1, null, '', 3, 'no load'), 'You predicted 1.00. The model value is not defined: no load.');
is('escape', U.esc('<a "b">'), '&lt;a &quot;b&quot;&gt;');

module.exports = { passed, failed };
