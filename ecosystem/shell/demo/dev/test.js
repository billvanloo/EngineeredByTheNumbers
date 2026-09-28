// Demo core tests. Run: node dev/test.js
'use strict';
const DemoCore = require('./core.js');
let passed = 0, failed = 0;
function near(name, got, exp) {
  const good = Math.abs(exp) < 1 ? Math.abs(got - exp) <= 0.01 : Math.abs(got - exp) / Math.abs(exp) <= 0.005;
  if (good) { passed++; console.log('  PASS ' + name); } else { failed++; console.log('  FAIL ' + name + ': got ' + got + ', expected ' + exp); }
}
const r = DemoCore.solve({ P: 500, N: 300 });
near('ω at 300 rpm', r.omega, 31.4);
near('T = P/ω (SB-6 torque)', r.T, 15.9);
console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exitCode = failed ? 1 : 0;
