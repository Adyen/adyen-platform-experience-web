import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const envPath = existsSync(resolve(rootDir, 'envs/.env')) ? resolve(rootDir, 'envs/.env') : resolve(rootDir, 'envs/env.default');

// Parse env file manually to avoid dotenv v17 stdout banner
const envContent = readFileSync(envPath, 'utf8');
const match = envContent.match(/^\s*PLAYGROUND_PORT\s*=\s*(\d+)\s*(?:#.*)?$/m);
const port = match ? match[1] : '6006';

const result = spawnSync('npx', ['storybook', 'dev', '-p', port, '--no-open'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
});

process.exit(result.status);
