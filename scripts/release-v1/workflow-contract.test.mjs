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
        '.github/workflows/v1-ga-dist-tag-cutover.yml',
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
            '.github/actions/setup-env/action.yml',
            '.github/workflows/compressed-size.yml',
            '.github/workflows/integration-tests.yml',
            '.github/workflows/npm-publish.yml',
            '.github/workflows/prepare-v1-release.yml',
            '.github/workflows/pull-request.yml',
            '.github/workflows/rehearse-v1-release.yml',
            '.github/workflows/release-v1.yml',
            '.github/workflows/rollback-v1-release.yml',
            '.github/workflows/trufflehog.yml',
            'config/release-v1.json',
            'scripts/npm-publish/determine-release.mjs',
            'scripts/npm-publish/determine-release.test.mjs',
            'scripts/release/version.mjs',
            'scripts/release-v1/release-v1.mjs',
            'scripts/release-v1/release-v1.test.mjs',
            'scripts/release-v1/workflow-contract.test.mjs',
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

test('integration-test deduplication requires a successful test job', () => {
    const workflow = readRepositoryFile('.github/workflows/integration-tests.yml');

    assert.match(workflow, /gh run view "\$RUN_ID" --repo "\$REPOSITORY" --json jobs/);
    assert.match(workflow, /startswith\("e2e-local-mocked-api"\)/);
    assert.match(workflow, /SUCCESSFUL_RUNS_FOR_HEAD=1/);
});
