// Confirms the inline code in index.html matches the tested copies, then runs
// the inline core. Run: node dev/verify-html.js   (add --fix to copy dev/core.js in)
'use strict';
const path = require('path');
const vb = require('./vendor/verify-blocks.js');
const root = path.join(__dirname, '..');
if (process.argv.includes('--fix') && vb.syncCore(root)) console.log('Copied dev/core.js into index.html.');
const problems = vb.verify(root);
problems.forEach(p => console.log('  FAIL ' + p));
const core = vb.loadInline(root, 'core');
const r = core.solve({ P: 500, N: 300 });
const ok = Math.abs(r.T - 15.915) < 0.01;
console.log((ok ? '  PASS' : '  FAIL') + ' inline core gives T = 15.9 N·m');
const failed = problems.length + (ok ? 0 : 1);
console.log('\n' + (failed ? failed + ' problems' : 'Inline code matches the tested copies.'));
process.exitCode = failed ? 1 : 0;
