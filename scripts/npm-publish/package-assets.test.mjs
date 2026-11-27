import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourcePackageAssetsScript = join(repositoryRoot, 'scripts', 'upload-assets', 'package-assets.sh');
const sourceBuildTranslationsScript = join(repositoryRoot, 'scripts', 'upload-assets', 'build-translations-tree.mjs');

const createFixtureRoot = () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), 'package-assets-test-'));
    const scriptsDir = join(fixtureRoot, 'scripts', 'upload-assets');
    mkdirSync(scriptsDir, { recursive: true });
    copyFileSync(sourcePackageAssetsScript, join(scriptsDir, 'package-assets.sh'));

    const hasBuildTranslationsScript = existsSync(sourceBuildTranslationsScript);
    if (hasBuildTranslationsScript) {
        copyFileSync(sourceBuildTranslationsScript, join(scriptsDir, 'build-translations-tree.mjs'));
        mkdirSync(join(fixtureRoot, 'packages', 'sdk', 'translations'), { recursive: true });
        writeFileSync(join(fixtureRoot, 'packages', 'sdk', 'translations', 'en-US.json'), JSON.stringify({ 'sample.key': 'Sample' }));
    } else {
        mkdirSync(join(fixtureRoot, 'packages', 'shared', 'core', 'src', 'config', 'translations'), { recursive: true });
        writeFileSync(join(fixtureRoot, 'packages', 'shared', 'core', 'src', 'config', 'translations', 'swapConfig.json'), '{}');
    }

    mkdirSync(join(fixtureRoot, 'packages', 'shared', 'assets', 'src'), { recursive: true });
    writeFileSync(join(fixtureRoot, 'packages', 'shared', 'assets', 'src', 'icon.svg'), '<svg></svg>');

    for (const domain of ['capital', 'disputes', 'payByLink']) {
        const configDir = join(fixtureRoot, 'packages', 'domains', domain, 'domain', 'src', 'config');
        mkdirSync(configDir, { recursive: true });
        writeFileSync(join(configDir, 'config.json'), '{}');
    }

    mkdirSync(join(fixtureRoot, 'dist', 'umd'), { recursive: true });
    writeFileSync(join(fixtureRoot, 'dist', 'umd', 'index.js'), 'console.log("umd");\n');
    writeFileSync(join(fixtureRoot, 'dist', 'adyen-platform-experience-web.css'), '.adyen-pe {}\n');

    return fixtureRoot;
};

const listArchiveEntries = archivePath =>
    execFileSync('/usr/bin/tar', ['-tzf', archivePath], { encoding: 'utf8' })
        .split('\n')
        .map(entry => entry.replace(/^\.\//, ''))
        .filter(Boolean);

test('package-assets.sh preserves default archive path when FE_SDK_ARCHIVE is unset', () => {
    const fixtureRoot = createFixtureRoot();

    try {
        const env = { ...process.env, RELEASE_LINE: 'v2', DEPLOY_ENV: 'test', SKIP_UMD_BUILD: 'true' };
        delete env.FE_SDK_ARCHIVE;

        const result = spawnSync('bash', [join(fixtureRoot, 'scripts', 'upload-assets', 'package-assets.sh')], {
            env,
            encoding: 'utf8',
        });

        assert.equal(result.status, 0, result.stderr);

        const expectedArchive = join(fixtureRoot, 'platform-components-v2_cdn.tar.gz');
        assert.equal(existsSync(expectedArchive), true);
        assert.match(result.stdout, new RegExp(`-> ${expectedArchive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'));

        const entries = listArchiveEntries(expectedArchive);
        assert.equal(entries.includes('index.js'), true);
        assert.equal(entries.includes('adyen-platform-experience-web.css'), true);
        assert.equal(entries.includes('config/capital/config.json'), true);
    } finally {
        rmSync(fixtureRoot, { recursive: true, force: true });
    }
});

test('package-assets.sh honors custom absolute FE_SDK_ARCHIVE and creates parent directories', () => {
    const fixtureRoot = createFixtureRoot();
    const outputRoot = mkdtempSync(join(tmpdir(), 'package-assets-output-'));

    try {
        const customArchive = join(outputRoot, 'nested', 'dir', 'custom-cdn.tar.gz');
        const result = spawnSync('bash', [join(fixtureRoot, 'scripts', 'upload-assets', 'package-assets.sh')], {
            env: {
                ...process.env,
                RELEASE_LINE: 'v10',
                DEPLOY_ENV: 'live',
                SKIP_UMD_BUILD: 'true',
                FE_SDK_ARCHIVE: customArchive,
            },
            encoding: 'utf8',
        });

        assert.equal(result.status, 0, result.stderr);
        assert.equal(existsSync(customArchive), true);
        assert.equal(existsSync(join(fixtureRoot, 'platform-components-v10_cdn.tar.gz')), false);
        assert.match(result.stdout, new RegExp(`-> ${customArchive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'));
        assert.doesNotMatch(result.stdout, new RegExp(`-> ${fixtureRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`));

        const entries = listArchiveEntries(customArchive);
        assert.equal(entries.includes('index.js'), false);
        assert.equal(entries.includes('adyen-platform-experience-web.css'), false);
        assert.equal(entries.includes('config/disputes/config.json'), true);
    } finally {
        rmSync(fixtureRoot, { recursive: true, force: true });
        rmSync(outputRoot, { recursive: true, force: true });
    }
});
