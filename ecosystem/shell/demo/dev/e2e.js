// Browser checks for the shell demo. Run: node dev/e2e.js
'use strict';
const path = require('path');
const kit = require('./vendor/e2e-kit.js');
(async () => {
  const t = await kit.start(path.join(__dirname, '..'));
  await kit.standard(t, {
    predictKeys: ['T'],
    change: async page => { await page.fill('#inP', '600'); },
    mutate: async page => { await page.fill('#inN', '450'); },
    shotDir: path.join(__dirname, 'screenshots'), shotName: 'demo',
  });
  console.log('Demo: field validation');
  await t.fresh();
  await t.page.fill('#inN', '0');
  t.ok('range message', (await t.page.textContent('#inNErr')) === 'Speed must be between 1 and 20,000 rpm.');
  await kit.noBadNumbers(t, 'invalid input');
  await t.finish();
})().catch(e => { console.error(e); process.exit(1); });
