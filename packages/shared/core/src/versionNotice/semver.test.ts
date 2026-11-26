import { describe, expect, test } from 'vitest';
import { compareVersions, parseVersion } from './semver';

const compare = (a: string, b: string) => compareVersions(parseVersion(a)!, parseVersion(b)!);

describe('parseVersion', () => {
    test('should parse a stable version', () => {
        expect(parseVersion('1.14.3')).toEqual({ major: 1, minor: 14, patch: 3, prerelease: [] });
    });

    test('should parse a prerelease version into its identifiers', () => {
        expect(parseVersion('2.0.0-beta.1')).toEqual({ major: 2, minor: 0, patch: 0, prerelease: ['beta', 1] });
    });

    test('should ignore build metadata', () => {
        expect(parseVersion('2.0.0-rc.0+sha.abc')).toEqual({ major: 2, minor: 0, patch: 0, prerelease: ['rc', 0] });
    });

    test.each(['', 'latest', '1.2', '1.2.x', 'v1.2.3', '1.2.3-', '01.2.3'])('should reject the malformed version "%s"', version => {
        expect(parseVersion(version)).toBeNull();
    });
});

describe('compareVersions', () => {
    test.each([
        ['1.0.0', '2.0.0'],
        ['1.1.0', '1.2.0'],
        ['1.1.1', '1.1.2'],
        ['2.0.0-beta.1', '2.0.0'],
        ['2.0.0-alpha.1', '2.0.0-beta.0'],
        ['2.0.0-beta.1', '2.0.0-beta.2'],
        ['2.0.0-beta.2', '2.0.0-beta.10'],
        ['2.0.0-beta', '2.0.0-beta.0'],
        ['2.0.0-beta.1', '2.0.0-beta.x'],
        ['2.0.0-beta.9', '2.0.1-beta.0'],
    ])('should order %s before %s', (lower, higher) => {
        expect(compare(lower, higher)).toBeLessThan(0);
        expect(compare(higher, lower)).toBeGreaterThan(0);
    });

    test('should treat versions that differ only in build metadata as equal', () => {
        expect(compare('2.0.0-beta.1+a', '2.0.0-beta.1+b')).toBe(0);
    });
});
