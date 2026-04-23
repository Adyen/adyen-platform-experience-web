import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const monorepoRoot = resolve(rootDir, '..');

// Load .env from this project's envs/ or fall back to monorepo envs/env.default
const envPath = existsSync(resolve(rootDir, 'envs/.env'))
    ? resolve(rootDir, 'envs/.env')
    : existsSync(resolve(monorepoRoot, 'envs/.env'))
      ? resolve(monorepoRoot, 'envs/.env')
      : resolve(monorepoRoot, 'envs/env.default');

const envContent = readFileSync(envPath, 'utf8');
const parsed = dotenv.parse(envContent);
const port = process.env.PLAYGROUND_PORT || parsed.PLAYGROUND_PORT || '6007';

const result = spawnSync('npx', ['storybook', 'dev', '-p', port, '--no-open'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        STORYBOOK: 'true',
        STORYBOOK_PORT: port,
    },
});

process.exit(result.status);
