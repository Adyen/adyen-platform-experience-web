import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import { resolve } from 'node:path';
import { lstat, readdir } from 'node:fs/promises';
import { getEnvironment } from '../../envs/getEnvs';
import { realApiProxies } from './src/endpoints/apis/realApiProxies';

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
    const { lemApi, BTLApi, BCLApi, playground, envIds } = getEnvironment(mode);
    return {
        root: mode === 'demo' ? demoPlaygroundDir : undefined,
        base: './',
        plugins: [preact()],
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
                '@adyen/adyen-fp-web': resolve(__dirname, '../lib/src/index'),
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
            proxy: mode === 'mocked' ? undefined : realApiProxies(lemApi, BTLApi, BCLApi),
        },
        preview: {
            host: playground.host,
            port: playground.port,
            proxy: undefined,
        },
        define: {
            'process.env.VITE_BALANCE_PLATFORM': JSON.stringify(BTLApi.balancePlatform || null),
            'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
            'process.env.VITE_ORG_LEGAL_ENTITY_ID': JSON.stringify(envIds.legalEntities.organization || null),
            'process.env.VITE_IND_LEGAL_ENTITY_ID': JSON.stringify(envIds.legalEntities.individual || null),
            'process.env.VITE_SOLE_PROPRIETORSHIP_LEGAL_ENTITY_ID': JSON.stringify(envIds.legalEntities.soleProprietorship || null),
            'process.env.VITE_DEFAULT_TRANSACTION_ID': JSON.stringify(envIds.transaction.defaultId || null),
            'process.env.VITE_DEFAULT_BALANCE_ACCOUNT_ID': JSON.stringify(envIds.balanceAccount.defaultId || null),
            'process.env.VITE_DEFAULT_ACCOUNT_HOLDER_ID': JSON.stringify(envIds.accountHolder.defaultId || null),
            'process.env.VITE_API_URL': JSON.stringify(playground.apiUrl || null),
            'process.env.VITE_PLAYGROUND_PORT': JSON.stringify(playground.port || null),
        },
    };
});
