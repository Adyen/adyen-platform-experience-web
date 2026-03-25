/**
 * @vitest-environment node
 */
import { expect, test } from 'vitest';
import { getPreactViteLibConfig } from '../../config/preact-vite-lib.config';

const expectedBuildEnvDefineKeys = [
    'process.env.SESSION_ACCOUNT_HOLDER',
    'process.env.SESSION_AUTO_REFRESH',
    'process.env.SESSION_MAX_AGE_MS',
    'process.env.SESSION_PERMISSIONS',
    'process.env.TEST_ENV',
    'process.env.USE_CDN',
    'process.env.VITE_APP_LOADING_CONTEXT',
    'process.env.VITE_APP_PORT',
    'process.env.VITE_APP_URL',
    'process.env.VITE_BUILD_ID',
    'process.env.VITE_COMMIT_BRANCH',
    'process.env.VITE_COMMIT_HASH',
    'process.env.VITE_LOCAL_ASSETS',
    'process.env.VITE_MODE',
    'process.env.VITE_TEST_CDN_ASSETS',
    'process.env.VITE_VERSION',
].sort();

test('getPreactViteLibConfig injects build environment defines', async () => {
    const configExport = getPreactViteLibConfig({
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
