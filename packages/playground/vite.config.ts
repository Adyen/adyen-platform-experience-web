import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import { resolve } from 'node:path';
import { lstat, readdir } from 'node:fs/promises';
import { ENVIRONMENTS, getEnvironment } from '../../envs/getEnvs';
import { realApiProxies } from './src/endpoints/apis/realApiProxies';
import { checker } from 'vite-plugin-checker';

const playgroundDir = resolve(__dirname, 'src/pages');
const demoPlaygroundDir = resolve(__dirname, './');
async function getPlaygroundEntrypoints() {
    const playgroundPages = await readdir(playgroundDir);

    const entries = await Promise.all(
        playgroundPages.map(async page => {
            if (!(await lstat(resolve(playgroundDir, page))).isDirectory()) return;

            return [page, resolve(playgroundDir, page, 'index.html')];
        })
    );
    const availableEntries: string[][] = entries.filter((entry): entry is string[] => Boolean(entry));
    return {
        ...Object.fromEntries(availableEntries),
        index: resolve(playgroundDir, '..', '..', 'index.html'),
    };
}

export default defineConfig(async ({ mode }) => {
    const { apiConfigs, playground, envIds } = getEnvironment(mode, process.env.ENV as ENVIRONMENTS);
    return {
        root: mode === 'demo' ? demoPlaygroundDir : undefined,
        base: './',
        plugins: [
            preact(),
            ['mocked', 'development'].includes(mode)
                ? checker({
                      stylelint: {
                          lintCommand: 'stylelint ../lib/src/**/*.scss',
                      },
                  })
                : undefined,
        ],
        build:
            mode === 'demo'
                ? {
                      outDir: resolve(__dirname, '.demo'),
                      emptyOutDir: true,
                      target: 'esnext',
                      rollupOptions: {
                          input: await getPlaygroundEntrypoints(),
                      },
                      minify: false,
                  }
                : undefined,
        resolve: {
            alias: {
                '@adyen/adyen-fp-web': resolve(__dirname, '../lib/src'),
                '@src': resolve(__dirname, '../lib/src'),
                '@styles': resolve(__dirname, '../lib/src/style'),
            },
        },
        css: {
            modules: {
                scopeBehaviour: mode === 'production' ? 'local' : undefined,
                generateScopedName: name => name,
            },
        },
        server: {
            host: playground.host,
            port: playground.port,
            https: false,
            proxy: mode === 'mocked' ? undefined : realApiProxies(apiConfigs),
            watch: {
                ignored: ['!**/node_modules/@adyen/adyen-fp-web/**'],
            },
        },
        optimizeDeps: {
            exclude: ['@adyen/adyen-fp-web'],
        },
        preview: {
            host: playground.host,
            port: playground.port,
            proxy: undefined,
        },
        define: {
            'process.env.VITE_BALANCE_PLATFORM': JSON.stringify(apiConfigs.BTLApi.balancePlatform || null),
            'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
            'process.env.VITE_ORG_LEGAL_ENTITY_ID': JSON.stringify(envIds.legalEntities.organization || null),
            'process.env.VITE_IND_LEGAL_ENTITY_ID': JSON.stringify(envIds.legalEntities.individual || null),
            'process.env.VITE_SOLE_PROPRIETORSHIP_LEGAL_ENTITY_ID': JSON.stringify(envIds.legalEntities.soleProprietorship || null),
            'process.env.VITE_DEFAULT_TRANSACTION_ID': JSON.stringify(envIds.transaction.defaultId || null),
            'process.env.VITE_DEFAULT_BALANCE_ACCOUNT_ID': JSON.stringify(envIds.balanceAccount.defaultId || null),
            'process.env.VITE_DEFAULT_ACCOUNT_HOLDER_ID': JSON.stringify(envIds.accountHolder.defaultId || null),
            'process.env.VITE_API_URL': JSON.stringify(playground.apiUrl || null),
            'process.env.VITE_PLAYGROUND_PORT': JSON.stringify(playground.port || null),
            'process.env.DEPLOYED_URL': JSON.stringify(process.env.DEPLOY_PRIME_URL || null),
            'process.env.VITE_LOADING_CONTEXT': JSON.stringify(process.env.DEPLOY_PRIME_URL?.replace('main--', '') || playground.apiUrl || null),
        },
    };
});
