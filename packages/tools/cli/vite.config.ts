import { cpSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const rootDir = resolve(__dirname, '../../..');
const distDir = resolve(rootDir, 'dist');
const { version } = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));

const VERSION_FIELD = /^(\s*adyen-platform-experience-version:\s*).*$/m;

const shipSkills = (): Plugin => ({
    name: 'ship-skills',
    closeBundle() {
        const target = join(distDir, 'skills');
        rmSync(target, { recursive: true, force: true });
        cpSync(resolve(__dirname, 'skills'), target, { recursive: true });
        for (const skill of readdirSync(target)) {
            const file = join(target, skill, 'SKILL.md');
            const content = readFileSync(file, 'utf8');
            if (!VERSION_FIELD.test(content)) throw new Error(`${file} has no adyen-platform-experience-version field`);
            writeFileSync(file, content.replace(VERSION_FIELD, `$1'${version}'`));
        }
    },
});

export default defineConfig({
    build: {
        ssr: resolve(__dirname, 'src/bin.ts'),
        outDir: join(distDir, 'cli'),
        emptyOutDir: true,
        target: 'node18',
        minify: false,
        rollupOptions: {
            output: {
                format: 'es',
                entryFileNames: 'index.js',
                banner: '#!/usr/bin/env node',
            },
        },
    },
    ssr: { noExternal: true },
    plugins: [shipSkills()],
});
