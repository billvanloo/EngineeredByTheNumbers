#!/usr/bin/env node
// Copies the canonical ecosystem files into each tool repo listed in
// ecosystem/vendor-manifest.json: into <repo>/dev/vendor/, and into the matching
// `/* BEGIN vendor:<file> */ … /* END vendor:<file> */` block of <repo>/index.html.
// Tool repos are siblings of this repo (for example ~/GitHub/ShaftBeamWorkbench).
//
//   node scripts/sync-vendor.js            # write
//   node scripts/sync-vendor.js --check    # report drift only; exit 1 if any
'use strict';
const fs = require('fs');
const path = require('path');

const here = path.resolve(__dirname, '..');
const eco = path.join(here, 'ecosystem');
const siblings = path.resolve(here, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(eco, 'vendor-manifest.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');
const NOT_INLINED = new Set(['verify-blocks.js', 'e2e-kit.js']);
const NOTE = '# Vendored files\n\nDo not edit these files here. They are copies of the canonical sources in the\n' +
  '[EngineeredByTheNumbers](https://github.com/billvanloo/EngineeredByTheNumbers) repository, `ecosystem/` folder.\n' +
  'Change them there, then run `node scripts/sync-vendor.js` in that repository to update this tool\n' +
  '(both this folder and the inline copies in `index.html`). `dev/verify-html.js` fails if they drift.\n';

let drift = 0, wrote = 0;
for (const [target, files] of Object.entries(manifest.targets)) {
  const root = path.resolve(siblings, target);
  if (!fs.existsSync(root)) { console.log('skip ' + target + ' (not found at ' + root + ')'); continue; }
  const vdir = path.join(root, 'dev', 'vendor');
  const htmlPath = path.join(root, 'index.html');
  let html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : null;
  const origHtml = html;
  if (!checkOnly) fs.mkdirSync(vdir, { recursive: true });
  for (const rel of files) {
    const src = fs.readFileSync(path.join(eco, rel), 'utf8');
    const base = path.basename(rel);
    const dst = path.join(vdir, base);
    const cur = fs.existsSync(dst) ? fs.readFileSync(dst, 'utf8') : null;
    if (cur !== src) {
      drift++;
      console.log((checkOnly ? 'DRIFT ' : 'update ') + path.relative(siblings, dst));
      if (!checkOnly) { fs.writeFileSync(dst, src); wrote++; }
    }
    if (html !== null && !NOT_INLINED.has(base)) {
      const b = '/* BEGIN vendor:' + base + ' */\n', e = '/* END vendor:' + base + ' */';
      const i = html.indexOf(b), j = i < 0 ? -1 : html.indexOf(e, i);
      if (i < 0 || j < 0) { console.log('WARN ' + target + '/index.html has no block for ' + base); drift++; continue; }
      if (html.slice(i + b.length, j) !== src) {
        drift++;
        console.log((checkOnly ? 'DRIFT ' : 'update ') + target + '/index.html block ' + base);
        html = html.slice(0, i + b.length) + src + html.slice(j);
      }
    }
  }
  const notePath = path.join(vdir, 'VENDORED.md');
  if (!checkOnly && (!fs.existsSync(notePath) || fs.readFileSync(notePath, 'utf8') !== NOTE)) fs.writeFileSync(notePath, NOTE);
  if (!checkOnly && html !== origHtml) { fs.writeFileSync(htmlPath, html); wrote++; }
  // The tool's own core block follows its dev/core.js (tool-local, but kept in step here too).
  const corePath = path.join(root, 'dev', 'core.js');
  if (html !== null && fs.existsSync(corePath)) {
    const vb = require(path.join(eco, 'tooling', 'verify-blocks.js'));
    const b = vb.blocks(fs.readFileSync(htmlPath, 'utf8')).find(x => x.name === 'core');
    if (b && b.text !== fs.readFileSync(corePath, 'utf8')) {
      drift++;
      console.log((checkOnly ? 'DRIFT ' : 'update ') + target + '/index.html core block');
      if (!checkOnly) { vb.syncCore(root); wrote++; }
    }
  }
}
console.log(checkOnly ? (drift ? drift + ' vendored copies are out of date. Run node scripts/sync-vendor.js' : 'All vendored copies are current.') : (wrote ? 'Updated ' + wrote + ' files.' : 'Everything was already current.'));
if (checkOnly && drift) process.exitCode = 1;
