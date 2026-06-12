import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import version from './config/version';
import { lstat, readdir } from 'node:fs/promises';
import { getEnvironment } from './envs/getEnvs';
import { preact } from '@preact/preset-vite';
const currentVersion = version();

const demoDir = resolve(__dirname, 'demo/pages');
const demoRootDir = resolve(__dirname, 'demo');

async function getDemoEntrypoints() {
    const demoPages = await readdir(demoDir);

    const entries = await Promise.all(
        demoPages.map(async page => {
            if (!(await lstat(resolve(demoDir, page))).isDirectory()) return;
            return [page, resolve(demoDir, page, 'index.html')];
        })
    );
    const availableEntries: string[][] = entries.filter((entry): entry is string[] => Boolean(entry));
    return {
        ...Object.fromEntries(availableEntries),
        index: resolve(demoDir, '..', 'index.html'),
    };
}

export default defineConfig(async ({ mode }) => {
    const { apiConfigs, playground } = getEnvironment(mode);
    return {
        root: demoRootDir,
        base: '',
        json: {
            stringify: true,
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                    silenceDeprecations: ['legacy-js-api'],
                },
            },
        },
        build: {
            outDir: resolve(__dirname, '.demo'),
            emptyOutDir: true,
            target: 'esnext',
            rollupOptions: {
                input: await getDemoEntrypoints(),
            },
            minify: false,
        },
        define: {
            'process.env.VITE_VERSION': JSON.stringify(currentVersion.ADYEN_FP_VERSION),
            'process.env.VITE_COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.VITE_COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
            'process.env.VITE_ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
            'process.env.VITE_LOADING_CONTEXT': JSON.stringify(
                mode === 'development' || mode === 'local-env' ? playground.loadingContext || null : null
            ),
            'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
            'process.env.VITE_PLAYGROUND_PORT': JSON.stringify(playground.port || null),
            'process.env.DEPLOYED_URL': JSON.stringify(process.env.DEPLOY_PRIME_URL || null),
            'process.env.VITE_PLAYGROUND_URL': JSON.stringify(
                process.env.DEPLOY_PRIME_URL?.replace('chore-level-access-demo--', '') || playground.playgroundUrl || null
            ),
            'process.env.E2E_TEST': JSON.stringify(process.env.E2E_TEST),
            'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(apiConfigs.sessionApi.accountHolder || null),
            'process.env.SESSION_PERMISSIONS': JSON.stringify(apiConfigs.sessionApi.permissions || null),
        },
        server: {
            host: playground.host,
            port: playground.port,
            https: false,
            proxy: undefined,
        },
        preview: {
            host: playground.host,
            port: playground.port,
            proxy: undefined,
        },
        plugins: [
            preact(),
        ],
    };
});
