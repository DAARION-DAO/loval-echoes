import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const protectedFunctions = [
  'auth-security',
  'login-fix',
  'auto-register',
  'embed-document',
  'rag-search',
  'ai-agent-chat',
];

const protectedFunctionFiles = [
  'supabase/functions/ai-agent-chat/index.ts',
  'supabase/functions/embed-document/index.ts',
  'supabase/functions/rag-search/index.ts',
  'supabase/functions/push-send/index.ts',
];

const failures = [];
const config = readFileSync('supabase/config.toml', 'utf8');

for (const fn of protectedFunctions) {
  const pattern = new RegExp(`\\[functions\\.${fn}\\][\\s\\S]*?verify_jwt\\s*=\\s*true`);
  if (!pattern.test(config)) {
    failures.push(`Expected ${fn} to have verify_jwt = true`);
  }
}

for (const file of protectedFunctionFiles) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes('requireAuthenticatedUser(')) {
    failures.push(`${file} must call requireAuthenticatedUser`);
  }
}

const allFunctionSource = protectedFunctionFiles
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

const historicalFallbackKey = ['loval', 'echoes', 'internal', 'key', '2026'].join('-');
if (allFunctionSource.includes(historicalFallbackKey)) {
  failures.push('push-send must not contain the historical hardcoded internal key fallback');
}

try {
  execFileSync('git', ['ls-files', '--error-unmatch', '.env'], { stdio: 'ignore' });
  failures.push('.env is still tracked by git');
} catch {
  // Expected: git exits non-zero when .env is not tracked.
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Security static checks passed');
