// Runs Admin API GraphQL through the Shopify CLI.
// Auth comes from `shopify store auth` (see docs/shopify-setup.md), so no admin token is stored in this repo.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { STORE_DOMAIN } from './config.mjs';

function parse(stdout) {
  // With --json the CLI prints one progress line per step, then the result as one JSON document.
  const start = stdout.indexOf('\n{\n');
  const body = start >= 0 ? stdout.slice(start + 1) : stdout.slice(stdout.indexOf('{'));
  return JSON.parse(body);
}

/** Runs a query or mutation and returns `data`. Throws on GraphQL errors or user errors. */
export function admin(query, variables = {}, { mutation = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'pmm-'));
  try {
    const qf = join(dir, 'q.graphql');
    const vf = join(dir, 'v.json');
    writeFileSync(qf, query);
    writeFileSync(vf, JSON.stringify(variables));
    const args = ['store', 'execute', '-s', STORE_DOMAIN, '-j', '--no-input', '--query-file', qf, '--variable-file', vf];
    if (mutation) args.push('--allow-mutations');
    const out = parse(execFileSync('shopify', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }));
    if (out.errors) throw new Error(JSON.stringify(out.errors));
    const data = out.data ?? out;
    for (const result of Object.values(data)) {
      if (result?.userErrors?.length) throw new Error(JSON.stringify(result.userErrors));
    }
    return data;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Runs a bulk mutation with one variables object per line, waits for it to finish, and returns the result lines.
 * The CLI starts the operation; polling and the result download happen here, because the CLI's own
 * --watch download can time out on large results.
 */
export async function bulkMutation(query, variableLines) {
  const dir = mkdtempSync(join(tmpdir(), 'pmm-'));
  try {
    const qf = join(dir, 'q.graphql');
    const vf = join(dir, 'v.jsonl');
    writeFileSync(qf, query);
    writeFileSync(vf, variableLines.map((v) => JSON.stringify(v)).join('\n') + '\n');
    execFileSync('shopify', ['store', 'bulk', 'execute', '-s', STORE_DOMAIN, '--no-input', '--allow-mutations',
      '--query-file', qf, '--variable-file', vf], { stdio: ['ignore', 'pipe', 'pipe'] });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  for (;;) {
    const op = admin('{ currentBulkOperation(type: MUTATION) { status objectCount errorCode url } }').currentBulkOperation;
    if (op.status === 'COMPLETED') {
      if (!op.url) return [];
      const text = await (await fetch(op.url)).text();
      return text.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
    }
    if (!['CREATED', 'RUNNING'].includes(op.status)) throw new Error(`Bulk operation ${op.status}: ${op.errorCode}`);
    process.stdout.write(`  ${op.objectCount} done...\r`);
    await new Promise((r) => setTimeout(r, 3000));
  }
}
