/**
 * @vitest-environment node
 */
import { expect, test } from 'vitest';
import { getViteLibConfig } from './vite-lib.config';
import sdkConfig from '../packages/sdk/vite.config';
import rootPkgJson from '../package.json';

const expectedBuildEnvDefineKeys = [
    'process.env.SESSION_ACCOUNT_HOLDER',
    'process.env.SESSION_AUTO_REFRESH',
    'process.env.SESSION_MAX_AGE_MS',
    'process.env.SESSION_PERMISSIONS',
    'process.env.TEST_ENV',
    'process.env.USE_CDN',
    'process.env.NODE_ENV',
    'process.env.VITE_APP_LOADING_CONTEXT',
    'process.env.VITE_APP_PORT',
    'process.env.VITE_APP_URL',
    'process.env.VITE_BUILD_ID',
    'process.env.VITE_COMMIT_BRANCH',
    'process.env.VITE_COMMIT_HASH',
    'process.env.VITE_LOCAL_ASSETS',
    'process.env.VITE_MODE',
    'process.env.VITE_TEST_CDN_ASSETS',
    'process.env.SDK_VERSION',
].sort();

test('getViteLibConfig injects build environment defines', async () => {
    const configExport = getViteLibConfig({
        projectRoot: import.meta.dirname,
        entry: 'index.ts',
    });
    const config = await (typeof configExport === 'function'
        ? configExport({
              command: 'build',
              mode: 'production',
              isPreview: false,
              isSsrBuild: false,
          })
        : configExport);

    expect(Object.keys(config.define ?? {}).sort()).toEqual(expectedBuildEnvDefineKeys);
});

test('SDK build filenames normalize Windows separators', async () => {
    const config = await (typeof sdkConfig === 'function'
        ? sdkConfig({
              command: 'build',
              mode: 'production',
              isPreview: false,
              isSsrBuild: false,
          })
        : sdkConfig);
    const fileName = config.build?.lib && config.build.lib.fileName;

    if (typeof fileName !== 'function') {
        throw new TypeError('Expected SDK build to define a filename function');
    }

    expect(fileName('es', 'packages\\sdk\\src\\index')).toBe('es/packages/sdk/src/index.js');
    expect(fileName('es', 'node_modules\\@adyen\\bento-vue3\\dist\\index')).toBe('es/external/@adyen/bento-vue3/dist/index.js');
    expect(fileName('cjs', 'node_modules\\vue\\index')).toBe('cjs/external/vue/index.cjs');
    expect(`./dist/${fileName('cjs', 'index')}`).toBe(rootPkgJson.exports['.'].require.default);
    expect(`./dist/${fileName('es', 'packages/sdk/src/index')}`).toBe(rootPkgJson.exports['.'].import.default);
});
