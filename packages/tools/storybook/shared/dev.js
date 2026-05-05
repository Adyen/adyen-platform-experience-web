import { spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { createConnection } from 'net';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../../../..');
const projectRoot = resolve(__dirname, '..');
const configDir = process.argv[2];

if (!configDir) {
    console.error('\nUsage: node shared/dev.js <config-dir>  (e.g. .storybook-preact)\n');
    process.exit(1);
}

const label = configDir.replace(/^\.storybook-/, '');
const envPath = existsSync(resolve(rootDir, 'envs/.env')) ? resolve(rootDir, 'envs/.env') : resolve(rootDir, 'envs/env.default');
const parsed = dotenv.parse(readFileSync(envPath, 'utf8'));
const port = parsed.PLAYGROUND_PORT || '3030';

// Preact and Vue Storybooks share PLAYGROUND_PORT because the backend CORS
// allowlist is bound to a single host:port pair. Fail fast with a human message.
const tryPort = host =>
    new Promise(r => {
        const sock = createConnection({ port, host })
            .once('connect', () => (sock.end(), r(true)))
            .once('error', () => r(false));
    });

if ((await tryPort('127.0.0.1')) || (await tryPort('::1'))) {
    console.error(`\n[storybook-${label}] Port ${port} is already in use. Is the sibling Storybook still running?\n`);
    process.exit(1);
}

const result = spawnSync('npx', ['storybook', 'dev', '-p', port, '--config-dir', configDir, '--no-open', '--ci'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
});

process.exit(result.status);
