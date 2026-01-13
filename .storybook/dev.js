import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const envPath = existsSync(resolve(rootDir, 'envs/.env')) ? resolve(rootDir, 'envs/.env') : resolve(rootDir, 'envs/env.default');

config({ path: envPath, quiet: true });
const port = process.env.PLAYGROUND_PORT || '6006';

const result = spawnSync('npx', ['storybook', 'dev', '-p', port], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
});

process.exit(result.status);
