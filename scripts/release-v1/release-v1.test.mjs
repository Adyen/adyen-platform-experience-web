import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
    parseStableV1Version,
    parseV1Version,
    resolveReleaseChannel,
    validateChangeset,
    validateV1Config,
    validateV1Transition,
    verifyPackedPackage,
} from './release-v1.mjs';

const packageName = '@adyen/adyen-platform-experience-web';
const scriptPath = join(dirname(fileURLToPath(import.meta.url)), 'release-v1.mjs');

const createReleaseConfig = () => ({
    branch: 'version/v1.x',
    npmTag: 'latest',
    prereleaseNpmTags: {
        alpha: 'v1-alpha',
        beta: 'v1-beta',
        rc: 'v1-rc',
        next: 'v1-next',
    },
    cdn: {
        test: 'v1-cdn-test',
        live: 'v1-cdn-live',
        assetName: 'platform-components-v1_cdn.tar.gz',
    },
});

test('parses supported stable and prerelease V1 versions', () => {
    assert.deepEqual(parseV1Version('1.13.2'), {
        major: 1,
        minor: 13,
        patch: 2,
        isPrerelease: false,
        prereleaseTag: null,
        prereleaseNumber: null,
    });
    assert.deepEqual(parseV1Version('1.13.2-beta.4'), {
        major: 1,
        minor: 13,
        patch: 2,
        isPrerelease: true,
        prereleaseTag: 'beta',
        prereleaseNumber: 4,
    });
    assert.deepEqual(parseStableV1Version('1.13.2'), {
        major: 1,
        minor: 13,
        patch: 2,
    });

    assert.throws(() => parseV1Version('2.0.0'), new Error('Expected a stable or supported prerelease V1 version, received "2.0.0"'));
    assert.throws(
        () => parseV1Version('1.13.2-preview.0'),
        new Error('Expected a stable or supported prerelease V1 version, received "1.13.2-preview.0"')
    );
    assert.throws(() => parseStableV1Version('1.13.2-beta.0'), new Error('Expected a stable V1 version, received "1.13.2-beta.0"'));
});

test('accepts supported V1 release transitions', () => {
    for (const [previousVersion, nextVersion] of [
        ['1.13.2', '1.13.3'],
        ['1.13.2', '1.13.3-beta.0'],
        ['1.13.3-beta.0', '1.13.3-beta.1'],
        ['1.13.3-beta.1', '1.13.3'],
    ]) {
        assert.equal(validateV1Transition(previousVersion, nextVersion), nextVersion);
    }
});

test('rejects skipped versions and direct prerelease channel switches', () => {
    for (const [previousVersion, nextVersion] of [
        ['1.13.2', '1.13.2'],
        ['1.13.2', '1.14.0'],
        ['1.13.2', '1.13.4'],
        ['1.13.3-beta.0', '1.13.3-beta.2'],
        ['1.13.3-alpha.1', '1.13.3-beta.0'],
        ['1.13.3-beta.1', '1.13.4-beta.0'],
    ]) {
        assert.throws(
            () => validateV1Transition(previousVersion, nextVersion),
            new Error(`Invalid V1 release transition from ${previousVersion} to ${nextVersion}`)
        );
    }
});

test('validates V1 configuration and resolves release channels', () => {
    const config = createReleaseConfig();

    assert.equal(validateV1Config(config), config);
    assert.deepEqual(resolveReleaseChannel(config, '1.13.2'), {
        npmTag: 'latest',
        cdnTag: 'v1-cdn-live',
        deployEnvironment: 'live',
        isPrerelease: false,
        prereleaseTag: null,
    });
    assert.deepEqual(resolveReleaseChannel(config, '1.13.3-rc.0'), {
        npmTag: 'v1-rc',
        cdnTag: 'v1-cdn-test',
        deployEnvironment: 'test',
        isPrerelease: true,
        prereleaseTag: 'rc',
    });

    assert.throws(() => validateV1Config({ ...config, branch: 'main' }), new Error('V1 release branch must be "version/v1.x", received "main"'));
    assert.throws(() => validateV1Config({ ...config, npmTag: 'next' }), new Error('Stable V1 npm tag must be "latest" or "v1", received "next"'));
    assert.throws(
        () => validateV1Config({ ...config, prereleaseNpmTags: { ...config.prereleaseNpmTags, beta: 'beta' } }),
        new Error('V1 prerelease "beta" must use npm tag "v1-beta"')
    );
    assert.throws(() => validateV1Config(null), new Error('V1 release configuration must be an object'));
    assert.throws(
        () => validateV1Config({ ...config, prereleaseNpmTags: { ...config.prereleaseNpmTags, preview: 'v1-preview' } }),
        new Error('V1 prerelease npm mappings must contain exactly alpha, beta, rc, and next')
    );
    assert.throws(
        () => validateV1Config({ ...config, cdn: { ...config.cdn, test: 'cdn-test' } }),
        new Error('V1 CDN tags must be "v1-cdn-test" and "v1-cdn-live"')
    );
    assert.throws(
        () => validateV1Config({ ...config, cdn: { ...config.cdn, assetName: 'platform-components_cdn.tar.gz' } }),
        new Error('Unexpected V1 CDN asset name')
    );
});

test('validates a single root-package patch changeset', () => {
    assert.deepEqual(validateChangeset(`\uFEFF---\r\n"${packageName}": patch # release fix\r\n---\r\n\r\nRelease fix.\r\n`), {
        packageName,
        bumpType: 'patch',
    });

    assert.throws(() => validateChangeset('Release fix.'), new Error('Changeset must start with YAML frontmatter'));
    assert.throws(() => validateChangeset(null), new Error('Changeset contents must be a string'));
    assert.throws(
        () => validateChangeset(`---\ninvalid entry\n---\n\nRelease fix.\n`),
        new Error('Invalid Changeset frontmatter entry: "invalid entry"')
    );
    assert.throws(
        () => validateChangeset(`---\n"${packageName}": minor\n---\n\nRelease fix.\n`),
        new Error('Changeset frontmatter must contain exactly "@adyen/adyen-platform-experience-web": patch')
    );
});

test('verifies a packed package without resolving tar from a writable PATH directory', () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'release-v1-tar-'));
    const packageDirectory = join(temporaryDirectory, 'package');
    const tarballPath = join(temporaryDirectory, 'package.tgz');
    const executableDirectory = join(temporaryDirectory, 'bin');
    const markerPath = join(temporaryDirectory, 'writable-path-tar-ran');
    const fakeTarPath = join(executableDirectory, 'tar');
    const originalPath = process.env.PATH;
    const originalMarker = process.env.MALICIOUS_TAR_MARKER;

    mkdirSync(packageDirectory);
    mkdirSync(executableDirectory);
    writeFileSync(join(packageDirectory, 'package.json'), JSON.stringify({ name: packageName, version: '1.13.2' }));
    execFileSync('/usr/bin/tar', ['-czf', tarballPath, '-C', temporaryDirectory, 'package/package.json']);
    writeFileSync(fakeTarPath, '#!/bin/sh\ntouch "$MALICIOUS_TAR_MARKER"\nprintf \'{}\'\n', { mode: 0o755 });

    try {
        process.env.PATH = `${executableDirectory}:${originalPath ?? ''}`;
        process.env.MALICIOUS_TAR_MARKER = markerPath;

        verifyPackedPackage({ tarballPath, expectedVersion: '1.13.2' });

        assert.equal(existsSync(markerPath), false);
    } finally {
        if (originalPath === undefined) {
            delete process.env.PATH;
        } else {
            process.env.PATH = originalPath;
        }
        if (originalMarker === undefined) {
            delete process.env.MALICIOUS_TAR_MARKER;
        } else {
            process.env.MALICIOUS_TAR_MARKER = originalMarker;
        }
        rmSync(temporaryDirectory, { recursive: true, force: true });
    }
});

test('CLI validates transitions and reports missing arguments', () => {
    const validResult = spawnSync(process.execPath, [scriptPath, 'validate-transition', '--previous', '1.13.2', '--current', '1.13.3'], {
        encoding: 'utf8',
    });
    assert.equal(validResult.status, 0);
    assert.equal(validResult.stdout, '1.13.3\n');
    assert.equal(validResult.stderr, '');

    const invalidResult = spawnSync(process.execPath, [scriptPath, 'validate-transition', '--previous', '1.13.2'], { encoding: 'utf8' });
    assert.equal(invalidResult.status, 1);
    assert.equal(invalidResult.stdout, '');
    assert.equal(invalidResult.stderr, 'Missing required argument --current\n');
});
