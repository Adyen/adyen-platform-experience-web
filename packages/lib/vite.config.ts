import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'node:path';

const PLAYGROUND_PAGES_DIR = '../../playground/src/pages';

export default defineConfig({
    root: resolve(__dirname, PLAYGROUND_PAGES_DIR),
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.ts'),
            },
        },
    },
    plugins: [preact()],
});
