import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const readRepositoryFile = path => readFileSync(join(repositoryRoot, path), 'utf8');
const hasRepositoryFile = path => existsSync(join(repositoryRoot, path));

test('workflow event mappings use valid YAML structure', () => {
    const workflows = [
        '.github/workflows/compressed-size.yml',
        '.github/workflows/configure-v1-changesets.yml',
        '.github/workflows/integration-tests.yml',
        '.github/workflows/npm-publish.yml',
        '.github/workflows/prepare-v1-release.yml',
        '.github/workflows/pull-request.yml',
        '.github/workflows/rehearse-v1-release.yml',
        '.github/workflows/release-v1.yml',
        '.github/workflows/rollback-v1-release.yml',
        '.github/workflows/tag-and-release.yml',
        '.github/workflows/verify-v1-maintenance-tag.yml',
    ];

    for (const workflow of workflows.filter(hasRepositoryFile)) {
        assert.doesNotMatch(readRepositoryFile(workflow), /^on:[ \t]+\S+:/m, `${workflow} has multiple mapping keys on its on: line`);
    }
});

test(
    'V1 bootstrap installs every maintenance-branch release prerequisite',
    { skip: !hasRepositoryFile('.github/workflows/configure-v1-changesets.yml') },
    () => {
        const workflow = readRepositoryFile('.github/workflows/configure-v1-changesets.yml');
        const requiredFiles = [
            '.github/actions/publish-npm-logs/action.yml',
            '.github/actions/setup-env/action.yml',
            '.github/workflows/compressed-size.yml',
            '.github/workflows/integration-tests.yml',
            '.github/workflows/npm-publish.yml',
            '.github/workflows/prepare-v1-release.yml',
            '.github/workflows/pull-request.yml',
            '.github/workflows/rehearse-v1-release.yml',
            '.github/workflows/release-v1.yml',
            '.github/workflows/rollback-v1-release.yml',
            '.github/workflows/tag-and-release.yml',
            '.github/workflows/trufflehog.yml',
            '.github/workflows/upload-assets-to-release-tag.yml',
            'config/release-v1.json',
            'scripts/npm-publish/determine-release.mjs',
            'scripts/npm-publish/determine-release.test.mjs',
            'scripts/release/version.mjs',
            'scripts/release-v1/release-v1.mjs',
            'scripts/release-v1/release-v1.test.mjs',
            'scripts/release-v1/workflow-contract.test.mjs',
            'scripts/upload-assets/generate-umd-file.sh',
            'scripts/upload-assets/package-assets.sh',
        ];

        for (const file of requiredFiles) {
            assert.match(workflow, new RegExp(`^\\s+${file.replaceAll('.', '\\.')}$`, 'm'), `${file} is missing from the V1 bootstrap`);
        }
        assert.match(workflow, /jq '\.baseBranch = "version\/v1\.x"'/);
        assert.match(workflow, /\.scripts\["test:release"\]/);
    }
);

test('V1 pull requests protect Changesets and automated release identities', () => {
    const workflow = readRepositoryFile('.github/workflows/pull-request.yml');

    assert.match(workflow, /PR_AUTHOR: \$\{\{ github\.event\.pull_request\.user\.login \}\}/);
    assert.match(workflow, /\$PR_AUTHOR" == "github-actions\[bot\]"/);
    assert.match(workflow, /IS_BOOTSTRAP_PR=false/);
    assert.match(workflow, /"\$HEAD_REF" == "chore\/v1-release-automation"/);
    assert.match(workflow, /"\$PR_TITLE" == "chore\(release\): bootstrap V1 automation"/);
    assert.match(workflow, /A V1 bootstrap PR may change only the test:release package script\./);
    assert.match(workflow, /Ordinary V1 pull requests may only add, not modify or delete, Changeset files\./);
    assert.match(workflow, /\^chore\/v1-prerelease-enter-\(alpha\|beta\|rc\|next\)\$/);
    assert.match(workflow, /\^chore\/v1-prerelease-exit-\(alpha\|beta\|rc\|next\)\$/);
});

test('lint and type checks are scoped to V1 pull requests', () => {
    const workflow = readRepositoryFile('.github/workflows/pull-request.yml');

    assert.match(workflow, /- name: Run lint checks\n\s+if: .*base\.ref == 'version\/v1\.x'/);
    assert.match(workflow, /- name: Run type checks\n\s+if: .*base\.ref == 'version\/v1\.x'/);
});

test('V1 state preparation reuses one branch per transition', () => {
    const workflow = readRepositoryFile('.github/workflows/prepare-v1-release.yml');

    assert.match(workflow, /STATE_BRANCH="chore\/v1-prerelease-enter-\$\{RELEASE_CHANNEL\}"/);
    assert.match(workflow, /STATE_BRANCH="chore\/v1-prerelease-exit-\$\{ACTIVE_MODE\}"/);
    assert.doesNotMatch(workflow, /STATE_BRANCH=.*GITHUB_RUN_ID/);
});

test('V1 releases require a pull request created by GitHub Actions', () => {
    const workflow = readRepositoryFile('.github/workflows/release-v1.yml');

    assert.match(workflow, /github\.event\.pull_request\.user\.login == 'github-actions\[bot\]'/);
});

test('V1 and mainline npm publishes use one trusted top-level workflow', () => {
    const trustedPublisher = readRepositoryFile('.github/workflows/tag-and-release.yml');
    const v1Release = readRepositoryFile('.github/workflows/release-v1.yml');
    const v1Route = trustedPublisher.match(/^  release-v1:[\s\S]*?(?=^  create-github-release:)/m)?.[0] ?? '';

    assert.match(trustedPublisher, /branches:.*version\/v1\.x/);
    assert.match(v1Route, /github\.event\.pull_request\.merged == true/);
    assert.match(v1Route, /github\.event\.pull_request\.user\.login == 'github-actions\[bot\]'/);
    assert.match(v1Route, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
    assert.match(v1Route, /startsWith\(github\.event\.pull_request\.head\.ref, 'chore\/v1-release-'\)/);
    assert.match(v1Route, /uses: \.\/\.github\/workflows\/release-v1\.yml/);
    assert.match(v1Route, /secrets: inherit/);
    assert.match(trustedPublisher, /github\.event\.pull_request\.base\.ref == 'main'/);
    assert.match(v1Release, /^on:\n\s+workflow_call:/m);
    assert.doesNotMatch(v1Release, /^on:\n\s+pull_request:/m);
});

test('V1 and mainline releases use strict npm channels', () => {
    const releaseConfig = JSON.parse(readRepositoryFile('config/release-v1.json'));
    const npmPublish = readRepositoryFile('.github/workflows/npm-publish.yml');
    const trustedPublisher = readRepositoryFile('.github/workflows/tag-and-release.yml');
    const cutover = readRepositoryFile('.github/workflows/verify-v1-maintenance-tag.yml');

    assert.equal(releaseConfig.npmTag, 'v1-latest');
    assert.match(npmPublish, /@adyen\/adyen-platform-experience-web@v1-latest/);
    assert.match(trustedPublisher, /node scripts\/npm-publish\/determine-release\.mjs determine[\s\S]*--release-line mainline/);
    assert.match(trustedPublisher, /@adyen\/adyen-platform-experience-web@v1-latest/);
    assert.match(trustedPublisher, /release_line: mainline/);
    assert.match(cutover, /v1-latest/);
    assert.match(cutover, /Publish the planned stable V1 maintenance release through the V1 pipeline before V2 GA/);
    assert.doesNotMatch(cutover, /Assign the npm v1-latest/);
    assert.doesNotMatch(cutover, /@adyen\/adyen-platform-experience-web@v1(?=[\s"'$])/);
});

test('CDN publishing isolates V1 and all mainline majors', () => {
    const workflow = readRepositoryFile('.github/workflows/upload-assets-to-release-tag.yml');
    const packageScript = readRepositoryFile('scripts/upload-assets/package-assets.sh');

    assert.match(workflow, /Release line must be v1 or a mainline major/);
    assert.match(workflow, /MAINLINE_MAJOR=\$\{RELEASE_LINE#v\}/);
    assert.match(workflow, /Mainline prereleases may publish only to test CDN channels/);
    assert.match(packageScript, /RELEASE_LINE must be v1 or a mainline major/);
});

test('integration-test deduplication requires a successful test job', () => {
    const workflow = readRepositoryFile('.github/workflows/integration-tests.yml');

    assert.match(workflow, /gh run view "\$RUN_ID" --repo "\$REPOSITORY" --json jobs/);
    assert.match(workflow, /startswith\("e2e-local-mocked-api"\)/);
    assert.match(workflow, /SUCCESSFUL_RUNS_FOR_HEAD=1/);
});
