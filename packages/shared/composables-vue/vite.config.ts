import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = resolve(fileURLToPath(import.meta.url), '..');

export default defineConfig({
    root: projectRoot,
    build: {
        lib: {
            entry: resolve(projectRoot, 'src/index.ts'),
        },
        rollupOptions: {
            output: [
                {
                    format: 'es',
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    sourcemap: true,
                    indent: false,
                },
            ],
        },
        outDir: resolve(projectRoot, 'dist'),
        emptyOutDir: true,
    },
});
