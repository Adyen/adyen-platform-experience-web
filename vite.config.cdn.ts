import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { preact } from '@preact/preset-vite';
import { cdnComponents } from './config/vite/plugins/cdnComponents';

export default defineConfig({
    plugins: [
        preact(),
        ...cdnComponents({
            componentsDir: resolve(__dirname, 'src/components/cdn'),
        }),
    ],
});
