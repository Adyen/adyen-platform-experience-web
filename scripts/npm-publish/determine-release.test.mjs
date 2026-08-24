import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { determineNpmRelease, validateStableV1Tag } from './determine-release.mjs';

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), 'determine-release.mjs');
const runnerTemp = '/tmp/npm-publish-runner';

const determine = overrides =>
    determineNpmRelease({
        packageVersion: '1.13.2',
        releaseVersion: '1.13.2',
        npmTag: 'v1-latest',
        releaseLine: 'v1',
        runnerTemp,
        ...overrides,
    });

test('determines stable and prerelease V1 publication metadata', () => {
    assert.deepEqual(determine(), {
        packageVersion: '1.13.2',
        packageTarball: '/tmp/npm-publish-runner/artifact/adyen-adyen-platform-experience-web-1.13.2.tgz',
        requiresStableV1Tag: false,
    });
    for (const prereleaseTag of ['alpha', 'beta', 'rc', 'next']) {
        const packageVersion = `1.13.2-${prereleaseTag}.0`;
        assert.equal(determine({ packageVersion, releaseVersion: packageVersion, npmTag: `v1-${prereleaseTag}` }).packageVersion, packageVersion);
    }
});

test('determines mainline publication metadata and V2 GA prerequisite', () => {
    assert.throws(() => determine({ releaseLine: 'mainline' }), /Mainline publishing requires major version 2 or higher/);
    assert.throws(
        () =>
            determine({
                packageVersion: '1.13.2-beta.0',
                releaseVersion: '1.13.2-beta.0',
                releaseLine: 'mainline',
                npmTag: 'beta',
            }),
        /Mainline publishing requires major version 2 or higher/
    );
    assert.equal(
        determine({ packageVersion: '2.0.0', releaseVersion: '2.0.0', releaseLine: 'mainline', npmTag: 'latest' }).requiresStableV1Tag,
        true
    );
    assert.equal(
        determine({ packageVersion: '3.0.0', releaseVersion: '3.0.0', releaseLine: 'mainline', npmTag: 'latest' }).requiresStableV1Tag,
        false
    );

    for (const prereleaseTag of ['alpha', 'beta', 'rc', 'next']) {
        const packageVersion = `2.0.0-${prereleaseTag}.0`;
        const release = determine({ packageVersion, releaseVersion: packageVersion, npmTag: prereleaseTag, releaseLine: 'mainline' });
        assert.equal(release.requiresStableV1Tag, false);
    }
});

test('rejects mismatched versions, release lines, npm tags, and malformed versions', () => {
    assert.throws(() => determine({ releaseVersion: '1.13.3' }), /does not match release version/);
    assert.throws(() => determine({ releaseLine: 'other' }), /Release line must be mainline or v1/);
    assert.throws(() => determine({ packageVersion: '2.0.0', releaseVersion: '2.0.0' }), /V1 publishing requires/);
    for (const npmTag of ['latest', 'v1', 'other']) {
        assert.throws(() => determine({ npmTag }), /Stable V1 releases must publish to v1-latest/);
    }
    assert.throws(
        () => determine({ packageVersion: '1.13.2-beta.0', releaseVersion: '1.13.2-beta.0', npmTag: 'v1-alpha' }),
        /must publish to v1-beta/
    );
    assert.throws(
        () => determine({ packageVersion: '2.0.0', releaseVersion: '2.0.0', releaseLine: 'mainline', npmTag: 'next' }),
        /Stable mainline releases must publish to latest/
    );
    assert.throws(
        () => determine({ packageVersion: '2.0.0-beta.0', releaseVersion: '2.0.0-beta.0', releaseLine: 'mainline', npmTag: 'alpha' }),
        /must publish to its validated prerelease tag/
    );

    for (const packageVersion of ['01.0.0', '1.0.0-preview.0', '1.0.0-beta.01', '1.0', '9007199254740992.0.0', '1.0.0-beta.9007199254740992']) {
        assert.throws(() => determine({ packageVersion, releaseVersion: packageVersion }), /Expected a stable or supported prerelease version/);
    }
});

test('validates that the v1-latest dist-tag points to a stable V1 version', () => {
    assert.equal(validateStableV1Tag('1.13.2'), '1.13.2');
    for (const version of ['1.13.2-beta.0', '2.0.0', '01.0.0', 'invalid']) {
        assert.throws(() => validateStableV1Tag(version), /v1-latest must point to a stable V1 version/);
    }
});

test('CLI emits GitHub environment entries only after successful validation', () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'npm-publish-release-'));
    const packageJsonPath = join(temporaryDirectory, 'package.json');
    writeFileSync(packageJsonPath, JSON.stringify({ version: '2.0.0' }));

    try {
        const result = spawnSync(
            process.execPath,
            [
                scriptPath,
                'determine',
                '--package-json',
                packageJsonPath,
                '--release-version',
                '2.0.0',
                '--npm-tag',
                'latest',
                '--release-line',
                'mainline',
                '--runner-temp',
                temporaryDirectory,
            ],
            { encoding: 'utf8' }
        );

        assert.equal(result.status, 0, result.stderr);
        assert.equal(
            result.stdout,
            [
                'PACKAGE_VERSION=2.0.0',
                `PACKAGE_TARBALL=${temporaryDirectory}/artifact/adyen-adyen-platform-experience-web-2.0.0.tgz`,
                'REQUIRES_STABLE_V1_TAG=true',
                '',
            ].join('\n')
        );

        const invalidResult = spawnSync(
            process.execPath,
            [
                scriptPath,
                'determine',
                '--package-json',
                packageJsonPath,
                '--release-version',
                '2.0.1',
                '--npm-tag',
                'latest',
                '--release-line',
                'mainline',
                '--runner-temp',
                temporaryDirectory,
            ],
            { encoding: 'utf8' }
        );
        assert.equal(invalidResult.status, 1);
        assert.equal(invalidResult.stdout, '');
        assert.match(invalidResult.stderr, /does not match release version/);
    } finally {
        rmSync(temporaryDirectory, { recursive: true, force: true });
    }
});
