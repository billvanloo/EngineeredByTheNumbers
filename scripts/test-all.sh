#!/usr/bin/env bash
# Runs every check across the curriculum repo and the sibling tool repos.
#   scripts/test-all.sh          unit tests, spec check, vendoring and inline-copy checks
#   scripts/test-all.sh --e2e    also the Playwright browser checks (slower)
set -u
here="$(cd "$(dirname "$0")/.." && pwd)"
siblings="$(dirname "$here")"
e2e=0; [ "${1:-}" = "--e2e" ] && e2e=1
fails=0
run() {   # run <label> <dir> <command...>
  local label="$1" dir="$2"; shift 2
  local out; out="$(cd "$dir" && "$@" 2>&1)"; local rc=$?
  local summary; summary="$(printf '%s\n' "$out" | grep -E 'passed|agree|current|match' | tail -1)"
  if [ $rc -eq 0 ]; then printf '  ok    %-44s %s\n' "$label" "$summary"
  else printf '  FAIL  %-44s %s\n' "$label" "$summary"; printf '%s\n' "$out" | grep -E 'FAIL|DRIFT|DIFF|Error' | head -20 | sed 's/^/        /'; fails=$((fails+1)); fi
}
echo "EngineeredByTheNumbers"
run "spec value check" "$here" node scripts/check-spec-values.js
run "ecosystem unit tests" "$here" node ecosystem/test/test.js
run "vendored copies current" "$here" node scripts/sync-vendor.js --check
demo="$here/ecosystem/shell/demo"
run "shell demo: unit" "$demo" node dev/test.js
run "shell demo: inline copy" "$demo" node dev/verify-html.js
[ $e2e -eq 1 ] && run "shell demo: browser (e2e)" "$demo" node dev/e2e.js
for repo in $(node -e "const m=require('$here/ecosystem/vendor-manifest.json');console.log(Object.keys(m.targets).filter(k=>!k.includes('/')).join(' '))"); do
  dir="$siblings/$repo"
  if [ ! -d "$dir" ]; then echo "$repo (not found, skipped)"; continue; fi
  echo "$repo"
  run "unit tests" "$dir" node dev/test.js
  run "inline copy" "$dir" node dev/verify-html.js
  [ $e2e -eq 1 ] && run "browser (e2e)" "$dir" node dev/e2e.js
done
echo
if [ $fails -eq 0 ]; then echo "All checks passed."; else echo "$fails check(s) failed."; exit 1; fi
