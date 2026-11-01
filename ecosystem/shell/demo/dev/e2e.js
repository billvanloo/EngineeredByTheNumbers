// Browser checks for the shell demo. Run: node dev/e2e.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const kit = require('./vendor/e2e-kit.js');
const root = path.join(__dirname, '..');

(async () => {
  const t = await kit.start(root);
  const { page } = t;
  await kit.standard(t, {
    predictKeys: ['T'],
    change: async p => { await p.fill('#inP', '600'); },
    mutate: async p => { await p.fill('#inN', '450'); },
    shotDir: path.join(__dirname, 'screenshots'), shotName: 'demo',
  });
  console.log('Demo: field validation');
  await t.fresh();
  await page.fill('#inN', '0');
  t.ok('range message', (await page.textContent('#inNErr')) === 'Speed must be between 1 and 20,000 rpm.');
  await kit.noBadNumbers(t, 'invalid input');

  console.log('Shell 1.2: tabs');
  await t.fresh();
  t.ok('tab list with two tabs', await page.locator('#shTabs[role="tablist"] [role="tab"]').count() === 2);
  t.ok('first tab selected', (await page.getAttribute('#shTab_shaft', 'aria-selected')) === 'true' && (await page.getAttribute('#shTab_shaft', 'tabindex')) === '0');
  await page.focus('#shTab_shaft');
  await page.keyboard.press('ArrowRight');
  t.ok('→ selects the next tab', (await page.getAttribute('#shTab_notes', 'aria-selected')) === 'true' && await page.evaluate(() => document.activeElement.id) === 'shTab_notes');
  t.ok('the tool swaps its panel', await page.isVisible('#dmNotes') && !(await page.isVisible('#dmShaft')));
  t.ok('body carries the current tab', (await page.getAttribute('body', 'data-tab')) === 'notes');
  await page.keyboard.press('ArrowRight');
  t.ok('→ wraps to the first tab', (await page.getAttribute('#shTab_shaft', 'aria-selected')) === 'true');
  await page.keyboard.press('End');
  t.ok('End selects the last tab', (await page.getAttribute('#shTab_notes', 'aria-selected')) === 'true');
  await page.waitForTimeout(400);
  await page.reload(); await page.waitForFunction(() => !!window.__app);
  t.ok('the tab is remembered', (await page.getAttribute('#shTab_notes', 'aria-selected')) === 'true');
  await page.click('#shTab_shaft');
  await page.click('#shPredict');
  await page.fill('#shPf_T', '15'); await page.click('#shCheck');
  await page.click('#shTab_notes'); await page.click('#shTab_shaft');
  t.ok('switching tabs keeps a checked prediction', await page.locator('#shResultsBody .masked').count() === 0);
  await page.click('#shPredict');

  console.log('Shell 1.2: hold and the animation clock');
  await t.fresh();
  await page.evaluate(() => Anim.manual(true));
  await page.focus('body');
  await page.keyboard.down('s');
  t.ok('holding S starts the clock', await page.evaluate(() => window.__demo.spin.running));
  t.ok('the Spin button shows it is held', (await page.getAttribute('#dmSpin', 'aria-pressed')) === 'true');
  const x0 = await page.getAttribute('#dmMark', 'x2');
  await page.evaluate(() => Anim.advanceAll(0.5));
  t.ok('advancing the clock turns the marker', (await page.getAttribute('#dmMark', 'x2')) !== x0);
  t.near('0.5 s of simulation time', await page.evaluate(() => window.__demo.spin.time), 0.5);
  await page.keyboard.up('s');
  t.ok('releasing S stops the clock', !(await page.evaluate(() => window.__demo.spin.running)) && (await page.getAttribute('#dmSpin', 'aria-pressed')) === 'false');
  const box = await page.locator('#dmSpin').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  t.ok('pressing the Spin button starts the clock', await page.evaluate(() => window.__demo.spin.running));
  await page.mouse.up();
  t.ok('releasing the button stops it', !(await page.evaluate(() => window.__demo.spin.running)));
  await page.focus('#inP');
  await page.keyboard.down('s'); await page.keyboard.up('s');
  t.ok('S typed in a number box does not spin', !(await page.evaluate(() => window.__demo.spin.running)));
  await page.evaluate(() => Anim.manual(false));

  console.log('Shell 1.2: challenges');
  await t.fresh();
  t.ok('challenge picker hidden in sandbox', !(await page.isVisible('#shChallenge')));
  await page.click('#shModes [data-mode="challenge"]');
  t.ok('challenge picker shows in challenge mode', await page.isVisible('#shChallenge'));
  t.ok('the example challenge is listed', (await page.textContent('#shChallenge')).includes('DM-1 · Hidden speed (example)'));
  await page.selectOption('#shChallenge', 'DM-1');
  t.ok('choosing a challenge turns predict first on', (await page.getAttribute('#shPredict', 'aria-pressed')) === 'true');
  t.ok('challenge inputs are applied', (await page.inputValue('#inP')) === '750' && await page.evaluate(() => window.__app.state.N === 600));
  t.ok('a hidden input shows "hidden" in a locked box', (await page.inputValue('#inN')) === 'hidden' && await page.isDisabled('#inN'));
  t.ok('the drawing hides it too', (await page.textContent('#dmDraw')).includes('N = hidden'));
  t.ok('the brief shows', await page.isVisible('#shBrief') && (await page.textContent('#shBrief')).includes('DM-1 · Hidden speed'));
  await kit.noBadNumbers(t, 'challenge with a hidden input');
  await page.click('#shPredict');
  t.ok('predict first stays on while a challenge needs it', (await page.getAttribute('#shPredict', 'aria-pressed')) === 'true');
  await page.focus('body');
  await page.keyboard.down('s');
  t.ok('the gate blocks Spin before a prediction is checked', !(await page.evaluate(() => window.__demo.spin.running)));
  await page.keyboard.up('s');
  t.ok('the gate explains why', (await page.textContent('#shToast')).includes('Check your prediction first.'));
  await page.fill('#shPf_T', '12');
  await page.click('#shCheck');
  const rec = await page.evaluate(() => window.__app.log[window.__app.log.length - 1]);
  t.ok('the log record uses the challenge id', rec.problemId === 'DM-1');
  t.ok('the challenge tolerance is used (12 vs 11.9 is a Match within 1%)', (await page.textContent('#shPfBox')).includes('Match'));
  await page.focus('body');
  await page.keyboard.down('s');
  t.ok('after Check, Spin runs', await page.evaluate(() => window.__demo.spin.running));
  await page.keyboard.up('s');
  const saved = await kit.download(t, () => page.click('#shSave'));
  t.ok('file names carry the challenge id', /_shell-demo_DM-1_/.test(saved.name), saved.name);
  await page.evaluate(() => { window.print = () => { }; });
  await page.click('#shReport');
  t.ok('the report does not reveal a hidden input', (await page.textContent('#sh-report')).includes('hidden in this challenge') && (await page.textContent('#sh-report')).includes('Challenge DM-1'));
  await page.click('#shModes [data-mode="sandbox"]');
  t.ok('back in sandbox the input is shown again', (await page.inputValue('#inN')) === '600' && !(await page.isDisabled('#inN')) && !(await page.isVisible('#shBrief')));

  console.log('Shell 1.2: a teacher\'s challenge list');
  await page.click('#shSettings');
  t.ok('settings has the challenge list box', await page.isVisible('#shChText'));
  await page.fill('#shChText', '{"challenges": [');
  await page.click('#shChSave');
  t.ok('bad JSON is explained', (await page.textContent('#shChMsg')).includes('not valid JSON'));
  await page.fill('#shChText', JSON.stringify({ tool: 'Shell Demo', challenges: [{ id: 'DM-9', title: 'Teacher set', inputs: { P: 1000, N: 1000 } }] }));
  await page.click('#shChSave');
  t.ok('a good list is saved', (await page.textContent('#shChMsg')) === 'Saved 1 challenge.');
  await page.keyboard.press('Escape');
  await page.click('#shModes [data-mode="challenge"]');
  t.ok('the teacher list replaces the examples', (await page.textContent('#shChallenge')).includes('DM-9 · Teacher set') && !(await page.textContent('#shChallenge')).includes('DM-1'));
  await page.selectOption('#shChallenge', 'DM-9');
  t.ok('an ungated challenge lets Spin run before Check', await page.evaluate(() => window.__app.gate()));
  await page.click('#shSettings'); await page.click('#shChReset'); await page.keyboard.press('Escape');
  t.ok('the examples can be restored', (await page.textContent('#shChallenge')).includes('DM-1'));

  console.log('Shell 1.2: reduced motion');
  {
    const ctx = await t.browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const p2 = await ctx.newPage(); t.watch(p2);
    await p2.goto(t.base + '/index.html'); await p2.waitForFunction(() => !!window.__app);
    await p2.focus('body'); await p2.keyboard.down('s'); await p2.keyboard.up('s');
    t.ok('with reduced motion the clock does not run', !(await p2.evaluate(() => window.__demo.spin.running)));
    t.ok('and the tool says why', (await p2.textContent('#dmSpinMsg')).includes('Motion is reduced'));
    await ctx.close();
  }
  await t.close();
  const passed1 = t.passed, failed1 = t.failed, fails1 = t.fails.slice(), errs1 = t.errors.slice();

  /* ------------------------------------------------ grouped predict first */
  const g = await kit.start(root, { page: 'dev/fixture-v12.html' });
  const gp = g.page;
  console.log('Shell 1.2: grouped predict first and working');
  await g.fresh();
  await gp.click('#shPredict');
  g.ok('one box per group', await gp.locator('#shPfBox .pfgroup').count() === 2 && (await gp.textContent('#shPfBox')).includes('Step 1 · Speed'));
  g.ok('each group has its own Check', await gp.locator('#shCheck_speed').count() === 1 && await gp.locator('#shCheck_torque').count() === 1);
  await gp.click('#shWorking summary');
  await gp.fill('#shPf_w', '30');
  await gp.click('#shCheck_speed');
  g.ok('checking one group reveals only that group', (await gp.textContent('#fxW')).includes('31.4') && await gp.locator('#fxT .masked').count() === 1);
  g.ok('masked() is still true while a group is hidden', await gp.evaluate(() => window.__app.masked() && !window.__app.masked('speed') && window.__app.masked('torque')));
  const wk = await gp.textContent('#shWorkingBody');
  g.ok('working shows the checked group and hides the other', wk.includes('ω = 2πN/60') && !wk.includes('T = P/ω') && wk.includes('Hidden until you check'));
  g.ok('one record logged for the checked group', await gp.evaluate(() => window.__app.log.length === 1 && window.__app.log[0].quantity === 'angular speed omega'));
  await gp.evaluate(() => { window.print = () => { }; });
  await gp.click('#shReport');
  const rep1 = await gp.textContent('#sh-report');
  g.ok('report lists the working by group, hiding the unchecked one', rep1.includes('Speed') && rep1.includes('Torque') && rep1.includes('Hidden until the prediction is checked.') && rep1.includes('2πN/60'));
  await gp.fill('#shPf_T', '16');
  await gp.press('#shPf_T', 'Enter');
  g.ok('Enter checks that group', await gp.locator('#shResultsBody .masked').count() === 0 && await gp.evaluate(() => !window.__app.masked()));
  g.ok('two records logged', await gp.evaluate(() => window.__app.log.length === 2));
  await gp.click('#shAgain_torque');
  g.ok('Predict again on one group hides only that group', await gp.locator('#fxT .masked').count() === 1 && await gp.locator('#fxW .masked').count() === 0);
  await gp.fill('#inP', '600');
  g.ok('changing an input hides every group again', await gp.locator('#shResultsBody .masked').count() === 2);
  await kit.noBadNumbers(g, 'grouped predict first');
  await g.close();
  const passed2 = g.passed, failed2 = g.failed, fails2 = g.fails, errs2 = g.errors;

  /* ------------------------------------------------ teacher tool */
  const tt = await kit.start(root, { page: 'dev/fixture-v12.html', query: '?teacher' });
  await kit.standard(tt, { teacherTool: true, mutate: async p => { await p.fill('#inN', '450'); } });
  console.log('Shell 1.2: teacher tool');
  await tt.fresh();
  const help = await (async () => { await tt.page.click('#shHelp'); const x = await tt.page.textContent('#shHelpDlg'); await tt.page.keyboard.press('Escape'); return x; })();
  tt.ok('help has no predict first section', !help.includes('Predict first'));
  tt.ok('results are never masked', await tt.page.locator('#shResultsBody .masked').count() === 0);
  tt.ok('Load accepts many files', await tt.page.evaluate(() => document.getElementById('shFile').multiple));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ebtn-files-'));
  const f1 = path.join(dir, 'a.json'), f2 = path.join(dir, 'b.csv');
  fs.writeFileSync(f1, '{"schema":"prediction-log","schemaVersion":1,"records":[]}'); fs.writeFileSync(f2, 'student,problemId\n');
  await tt.page.setInputFiles('#shFile', [f1, f2]);
  await tt.page.waitForFunction(() => window.__files.length === 2, null, { timeout: 3000 }).catch(() => { });
  tt.ok('onFiles gets every file with its text', await tt.page.evaluate(() => window.__files.length === 2 && window.__files[0].name === 'a.json' && window.__files[1].length > 0));
  fs.rmSync(dir, { recursive: true, force: true });
  await tt.page.evaluate(() => { window.print = () => { }; });
  await tt.page.click('#shReport');
  tt.ok('a tool can add its own report sections', (await tt.page.textContent('#sh-report')).includes('Class summary'));
  tt.ok('no console errors (teacher tool)', tt.errors.length === 0, tt.errors.join(' | '));
  await tt.close();

  const passed = passed1 + passed2 + tt.passed, failed = failed1 + failed2 + tt.failed;
  const errs = errs1.concat(errs2);
  const errOk = errs.length === 0;
  console.log('  ' + (errOk ? 'PASS' : 'FAIL') + ' no console errors during the run' + (errOk ? '' : ': ' + errs.slice(0, 5).join(' | ')));
  const all = fails1.concat(fails2, tt.fails, errOk ? [] : ['console errors']);
  console.log('\n' + (passed + (errOk ? 1 : 0)) + ' passed, ' + (failed + (errOk ? 0 : 1)) + ' failed');
  if (all.length) console.log('Failed: ' + all.join('; '));
  process.exitCode = all.length ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
