/**
 * @vitest-environment node
 */
import { expect, test } from 'vitest';
import viteConfig from '../vite.config';

test('coverage includes the complete first-party Vue runtime', async () => {
    const config =
        typeof viteConfig === 'function'
            ? await viteConfig({
                  command: 'serve',
                  mode: 'test',
                  isPreview: false,
                  isSsrBuild: false,
              })
            : viteConfig;

    expect(config.test?.coverage?.include).toEqual([
        'src/**/*.ts',
        'packages/sdk/src/**/*.ts',
        'packages/domains/*/{domain,vue}/src/**/*.{ts,vue}',
        'packages/shared/{composables-vue,core,utils}/src/**/*.{ts,vue}',
    ]);
});
