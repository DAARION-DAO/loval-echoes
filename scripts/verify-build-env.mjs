#!/usr/bin/env node
// Verifies that Vite inlined the required Supabase env vars into the production bundle.
// Never prints the values themselves — only presence + counts.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist/assets";

// Load .env values so we can verify the *exact* values Vite should have
// inlined, without hardcoding any format-specific regex. Values are never
// printed — only presence is reported.
function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(".env", "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      let [, k, v] = m;
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (env[k] === undefined) env[k] = v;
    }
  } catch {}
  return env;
}

const env = loadEnv();
const MARKERS = [
  { name: "VITE_SUPABASE_URL", value: env.VITE_SUPABASE_URL },
  { name: "VITE_SUPABASE_PUBLISHABLE_KEY", value: env.VITE_SUPABASE_PUBLISHABLE_KEY },
];

function decodeBase64UrlJson(segment) {
  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function getPublishableKeyFormat(value) {
  if (!value || typeof value !== "string" || value.trim() !== value || value.length === 0) {
    return "invalid_or_forbidden";
  }

  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value)) {
    return "publishable_format";
  }

  const jwtMatch = value.match(/^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/);
  if (!jwtMatch) {
    return "invalid_or_forbidden";
  }

  const payload = decodeBase64UrlJson(jwtMatch[2]);
  if (payload?.role === "anon") {
    return "legacy_anon_jwt_format";
  }

  return "invalid_or_forbidden";
}

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
for (const { name, value } of MARKERS) {
  if (!value) {
    console.error(`[verify-build-env] MISSING ${name} in build environment. Configure it before running vite build.`);
    failed = true;
    continue;
  }

  if (name === "VITE_SUPABASE_PUBLISHABLE_KEY") {
    const format = getPublishableKeyFormat(value);
    console.log(`[verify-build-env] VITE_SUPABASE_PUBLISHABLE_KEY format: ${format}`);
    if (format === "invalid_or_forbidden") {
      console.error("[verify-build-env] INVALID VITE_SUPABASE_PUBLISHABLE_KEY format. Use sb_publishable_* or a legacy anon JWT only.");
      failed = true;
      continue;
    }
  }

  const hits = files.filter((f) => readFileSync(f, "utf8").includes(value)).length;
  if (hits === 0) {
    console.error(`[verify-build-env] MISSING ${name} in bundle. Configure it in the production build env.`);
    failed = true;
  } else {
    console.log(`[verify-build-env] OK  ${name} present in ${hits} chunk(s).`);
  }
}
if (failed) process.exit(1);
console.log("[verify-build-env] All required VITE_SUPABASE_* markers present.");