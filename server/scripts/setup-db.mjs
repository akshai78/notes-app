import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { neon } from '@neondatabase/serverless';

const root = dirname(fileURLToPath(import.meta.url));
const serverRoot = join(root, '..');
const schemaPath = join(serverRoot, 'schema.sql');

function loadEnv(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(join(serverRoot, '.env.local'));
loadEnv(join(serverRoot, '.env'));

function splitSql(source) {
  return source
    .split(';')
    .map((part) =>
      part
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter(Boolean);
}

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error('DATABASE_URL is missing. Copy server/.env.example to server/.env.local and add your Neon pooled URL.');
    process.exit(1);
  }

  const sql = neon(url);
  const statements = splitSql(await readFile(schemaPath, 'utf8'));
  for (const statement of statements) {
    await sql.query(statement, []);
  }
  console.log(`Applied ${statements.length} statements from schema.sql`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
