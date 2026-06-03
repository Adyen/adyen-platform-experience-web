import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storybookBin = resolve(__dirname, '../node_modules/.bin/storybook');

const configDir = process.argv[2];

if (!configDir) {
    console.error('\nUsage: node scripts/dev.js <config-dir>  (e.g. src/.storybook/preact)\n');
    process.exit(1);
}

const framework = basename(configDir);
const projectDir = resolve(import.meta.dirname, '..');
const rootDir = resolve(import.meta.dirname, '../../../..');
const envDefaultPath = resolve(rootDir, 'envs/env.default');
const envPath = resolve(rootDir, 'envs/.env');

const envFilePath = existsSync(envPath) ? envPath : envDefaultPath;
const parsed = dotenv.parse(readFileSync(envFilePath, 'utf8'));
const port = parsed.PLAYGROUND_PORT || '3030';

// Storybooks share PLAYGROUND_PORT because the backend CORS allowlist
// is bound to a single host:port pair. Fail fast with a human message.
const tryPort = host =>
    new Promise(r => {
        const sock = createConnection({ port, host })
            .once('connect', () => (sock.end(), r(true)))
            .once('error', () => r(false));
    });

if ((await tryPort('127.0.0.1')) || (await tryPort('::1'))) {
    console.error(`\n[storybook-${framework}] Port ${port} is already in use. Is the sibling Storybook still running?\n`);
    process.exit(1);
}

const result = spawnSync(storybookBin, ['dev', '-p', port, '--config-dir', configDir, '--no-open', '--ci'], {
    cwd: projectDir,
    stdio: 'inherit',
});

process.exit(result.status ?? 1);
