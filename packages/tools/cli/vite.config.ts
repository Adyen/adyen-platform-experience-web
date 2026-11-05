import { cpSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { readField, setField, VERSION_FIELD } from './src/skills';

const rootDir = resolve(__dirname, '../../..');
const distDir = resolve(rootDir, 'dist');
const { version } = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));

const shipSkills = (): Plugin => ({
    name: 'ship-skills',
    closeBundle() {
        const target = join(distDir, 'skills');
        rmSync(target, { recursive: true, force: true });
        cpSync(resolve(__dirname, 'skills'), target, { recursive: true });
        for (const entry of readdirSync(target, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            const file = join(target, entry.name, 'SKILL.md');
            if (!readField(file, VERSION_FIELD)) throw new Error(`${file} has no ${VERSION_FIELD} field`);
            writeFileSync(file, setField(readFileSync(file, 'utf8'), VERSION_FIELD, version));
        }
    },
});

export default defineConfig({
    build: {
        ssr: resolve(__dirname, 'src/bin.ts'),
        outDir: join(distDir, 'cli'),
        emptyOutDir: true,
        target: 'node20',
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
