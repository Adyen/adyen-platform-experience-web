import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import currentVersion from './getVersion';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';
    const FILENAME = 'adyen-fp-web';

    return {
        root: './',
        plugins: [preact()],
        build: {
            sourcemap: isDev ? 'inline' : false,
            cssCodeSplit: true,
            minify: isDev ? false : 'terser',
            outDir: 'dist',
            assetsDir: '.',
            rollupOptions: {
                output: {
                    entryFileNames: `${FILENAME}.js`,
                    chunkFileNames: `${FILENAME}.js`,
                    assetFileNames: `${FILENAME}.css`,
                },
            },
        },
        define: {
            'process.env.VERSION': JSON.stringify(currentVersion.ADYEN_FP_VERSION),
            'process.env.COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
        },
    };
});
