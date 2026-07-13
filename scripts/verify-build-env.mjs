#!/usr/bin/env node
// Verifies that Vite inlined the required Supabase env vars into the production bundle.
// Never prints the values themselves — only presence + counts.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist/assets";
const MARKERS = [
  { name: "VITE_SUPABASE_URL", pattern: /\.supabase\.co/ },
  { name: "VITE_SUPABASE_PUBLISHABLE_KEY", pattern: /sb_publishable_[A-Za-z0-9_\-]{6,}/ },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

let files;
try {
  files = walk(DIST);
} catch {
  console.error(`[verify-build-env] Missing ${DIST}. Run 'vite build' first.`);
  process.exit(1);
}

let failed = false;
for (const { name, pattern } of MARKERS) {
  const hits = files.filter((f) => pattern.test(readFileSync(f, "utf8"))).length;
  if (hits === 0) {
    console.error(`[verify-build-env] MISSING ${name} in bundle. Configure it in the production build env.`);
    failed = true;
  } else {
    console.log(`[verify-build-env] OK  ${name} present in ${hits} chunk(s).`);
  }
}
if (failed) process.exit(1);
console.log("[verify-build-env] All required VITE_SUPABASE_* markers present.");