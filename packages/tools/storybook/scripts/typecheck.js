import { readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tscBin = resolve(__dirname, '../node_modules/.bin/tsc');

const configs = readdirSync('src/.storybook')
    .map(dir => `src/.storybook/${dir}/tsconfig.json`)
    .filter(existsSync);

const watch = process.argv.includes('--watch');
const tscArgs = watch ? ['--noEmit', '--watch'] : ['--noEmit'];
const processes = configs.map(config => spawn(tscBin, [...tscArgs, '-p', config], { stdio: 'inherit' }));

if (!watch) {
    const codes = await Promise.all(
        processes.map(
            p =>
                new Promise(resolve => {
                    p.on('close', resolve);
                    p.on('error', () => resolve(1));
                })
        )
    );
    process.exit(codes.some(code => code !== 0) ? 1 : 0);
}
