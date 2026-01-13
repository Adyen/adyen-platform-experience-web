import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const envPath = existsSync(resolve(rootDir, 'envs/.env')) ? resolve(rootDir, 'envs/.env') : resolve(rootDir, 'envs/env.default');

const envContent = readFileSync(envPath, 'utf8');
const parsed = dotenv.parse(envContent);
const port = parsed.PLAYGROUND_PORT || '6006';

const result = spawnSync('npx', ['storybook', 'dev', '-p', port, '--no-open'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
});

process.exit(result.status);
