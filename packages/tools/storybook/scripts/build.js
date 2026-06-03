import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storybookBin = resolve(__dirname, '../node_modules/.bin/storybook');
const viteBin = resolve(__dirname, '../node_modules/.bin/vite');

const args = process.argv.slice(2);
const preview = args.includes('--preview');
const configDir = args.find(a => !a.startsWith('--'));

if (!configDir) {
    console.error('\nUsage: node scripts/build.js <config-dir> [--preview] (e.g. src/.storybook/preact)\n');
    process.exit(1);
}

const projectDir = resolve(import.meta.dirname, '..');

const build = spawnSync(storybookBin, ['build', '--config-dir', configDir], {
    cwd: projectDir,
    stdio: 'inherit',
});

if (build.status !== 0) process.exit(build.status ?? 1);

if (preview) {
    const serve = spawnSync(viteBin, ['preview', '--outDir', 'storybook-static'], {
        cwd: projectDir,
        stdio: 'inherit',
    });
    process.exit(serve.status ?? 1);
}
