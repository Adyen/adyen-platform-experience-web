import { readdirSync, existsSync } from 'fs';
import { spawn } from 'child_process';

const configs = readdirSync('src/.storybook')
    .map(dir => `src/.storybook/${dir}/tsconfig.json`)
    .filter(existsSync);

const processes = configs.map(config => spawn('tsc', ['--noEmit', '-p', config], { stdio: 'inherit' }));
const codes = await Promise.all(processes.map(p => new Promise(resolve => p.on('close', resolve))));
process.exit(codes.some(code => code !== 0) ? 1 : 0);
