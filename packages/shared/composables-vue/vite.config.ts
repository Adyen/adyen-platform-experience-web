import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const projectRoot = resolve(fileURLToPath(import.meta.url), '..');

export default defineConfig({
    root: projectRoot,
    plugins: [vue()],
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
