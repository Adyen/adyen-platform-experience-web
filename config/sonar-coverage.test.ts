/**
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

const readProjectFile = (path: string) => readFileSync(resolve(__dirname, '..', path), 'utf8').replace(/\r\n/g, '\n');

test('Sonar measures unit TypeScript without excluding Vue from issue analysis', () => {
    const properties = readProjectFile('sonar-project.properties');
    const sourceExclusions = properties.match(/^sonar\.exclusions=(.+)$/m)?.[1]?.split(',') ?? [];
    const coverageExclusions = properties.match(/^sonar\.coverage\.exclusions=(.+)$/m)?.[1]?.split(',') ?? [];

    expect(properties).toMatch(/^sonar\.javascript\.lcov\.reportPaths=coverage-unit\/lcov\.info$/m);
    expect(sourceExclusions).toContain('**/coverage-unit/**');
    expect(coverageExclusions).toContain('**/*.vue');
    expect(sourceExclusions).not.toContain('**/*.vue');
    for (const path of [
        'packages/domains/*/fixtures/**',
        'packages/domains/*/mocks/**',
        'packages/domains/*/publish/**',
        'packages/domains/*/domain/tests/**',
        'packages/domains/*/vue/publish/**',
        'packages/domains/*/vue/stories/**',
        'packages/domains/*/vue/tests/**',
    ]) {
        expect(coverageExclusions).toContain(path);
        expect(sourceExclusions).not.toContain(path);
    }
});
