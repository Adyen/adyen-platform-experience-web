/**
 * @vitest-environment node
 */
import { afterEach, expect, test, vi } from 'vitest';
import type { ViteUserConfig } from 'vitest/config';
import viteConfig from '../vite.config';

const getConfig = async () => {
    const config: ViteUserConfig =
        typeof viteConfig === 'function'
            ? await viteConfig({
                  command: 'serve',
                  mode: 'test',
                  isPreview: false,
                  isSsrBuild: false,
              })
            : viteConfig;

    return config;
};

const getCoverage = async () => {
    const config = await getConfig();
    const coverage = config.test?.coverage;
    if (coverage?.provider !== 'v8') throw new Error('Expected V8 coverage configuration');
    return coverage;
};

afterEach(() => vi.unstubAllEnvs());

test('default coverage includes the complete first-party Vue runtime', async () => {
    vi.stubEnv('UNIT_LOGIC_COVERAGE', '');
    const coverage = await getCoverage();

    expect(coverage.include).toEqual([
        'src/**/*.ts',
        'packages/sdk/src/**/*.ts',
        'packages/domains/*/{domain,vue}/src/**/*.{ts,vue}',
        'packages/shared/{composables-vue,core,utils}/src/**/*.{ts,vue}',
    ]);
    expect(coverage.reportsDirectory).toMatch(/coverage$/);
});

test('unit coverage includes all first-party runtime TypeScript without Vue components', async () => {
    vi.stubEnv('UNIT_LOGIC_COVERAGE', 'true');
    const coverage = await getCoverage();

    expect(coverage).toHaveProperty('all', true);
    expect(coverage.include).toEqual([
        'src/**/*.ts',
        'packages/sdk/src/**/*.ts',
        'packages/domains/*/{domain,vue}/src/**/*.ts',
        'packages/shared/{composables-vue,core,utils}/src/**/*.ts',
    ]);
    expect(coverage.reportsDirectory).toMatch(/coverage-unit$/);
    expect(coverage.exclude).toContain('**/*.{test,spec}.{ts,vue}');
});
