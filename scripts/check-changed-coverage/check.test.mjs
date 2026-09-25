import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { analyzeChangedCoverage, pilotComment, pilotWarning, readChangedDiff } from './check.mjs';

const source = 'packages/domains/example/domain/src/Feature/rule.ts';
const patch = (file, hunk) => `diff --git a/${file} b/${file}
--- /dev/null
+++ b/${file}
${hunk}`;
const lcov = (file, lines) => `SF:${file}
${lines.map(([line, hits]) => `DA:${line},${hits}`).join('\n')}
end_of_record
`;

test('checks only executable added lines against the 80% threshold', () => {
    const diff = patch(source, '@@ -0,0 +1,4 @@\n+export const first = 1;\n+// comment\n+export const second = 2;\n+export const third = 3;\n');
    const report = lcov(source, [
        [1, 1],
        [3, 0],
        [4, 2],
    ]);

    assert.deepEqual(analyzeChangedCoverage(diff, report), {
        covered: 2,
        total: 3,
        missing: [],
        passed: false,
    });
});

test('passes at exactly 80% across multiple hunks and ignores removed lines', () => {
    const diff = patch(source, '@@ -4,1 +4,2 @@\n-old line\n+first line\n+second line\n@@ -10,0 +12,3 @@\n+third line\n+fourth line\n+fifth line\n');
    const report = lcov(source, [
        [4, 1],
        [5, 1],
        [12, 1],
        [13, 1],
        [14, 0],
    ]);

    assert.deepEqual(analyzeChangedCoverage(diff, report), {
        covered: 4,
        total: 5,
        missing: [],
        passed: true,
    });
});

test('skips Vue, test, excluded, and out-of-scope TypeScript files', () => {
    const files = [
        'packages/domains/example/vue/src/Feature/Filters.vue',
        'packages/domains/example/domain/src/Feature/rule.test.ts',
        'packages/domains/example/domain/src/Feature/index.ts',
        'packages/domains/example/domain/src/Feature/testing/fixture.ts',
        'packages/shared/types/src/api.ts',
        'scripts/helper.ts',
    ];
    const diff = files.map(file => patch(file, '@@ -0,0 +1 @@\n+new line\n')).join('');

    assert.deepEqual(analyzeChangedCoverage(diff, ''), {
        covered: 0,
        total: 0,
        missing: [],
        passed: true,
    });
});

test('reports a missing LCOV entry instead of treating unmeasured runtime code as covered', () => {
    const diff = patch(source, '@@ -0,0 +1 @@\n+export const rule = true;\n');

    assert.deepEqual(analyzeChangedCoverage(diff, ''), {
        covered: 0,
        total: 0,
        missing: [source],
        passed: false,
    });
});

test('skips comment-only changes when the source is present in LCOV', () => {
    const diff = patch(source, '@@ -10,0 +11 @@\n+// why this is safe\n');

    assert.deepEqual(analyzeChangedCoverage(diff, lcov(source, [[5, 1]])), {
        covered: 0,
        total: 0,
        missing: [],
        passed: true,
    });
});

test('matches absolute LCOV paths and ignores unchanged lines in a hunk', () => {
    const diff = patch(source, '@@ -7,2 +7,3 @@\n unchanged\n+new line\n unchanged\n');
    const report = lcov(join(process.cwd(), source), [
        [7, 0],
        [8, 1],
        [9, 0],
    ]);

    assert.deepEqual(analyzeChangedCoverage(diff, report), {
        covered: 1,
        total: 1,
        missing: [],
        passed: true,
    });
});

test('warns about uncovered new logic without claiming overall coverage decreased', () => {
    const result = { covered: 2, total: 3, missing: [], passed: false };
    assert.equal(
        pilotWarning(result),
        "New code unit-test coverage is 66.67%, below the 80% target. Merging as-is leaves 1 changed executable line without unit coverage, weakening the project's quality safeguards and raising regression risk. After the pilot, PRs below 80% will be blocked."
    );
    assert.equal(pilotWarning({ covered: 4, total: 5, missing: [], passed: true }), undefined);
    assert.equal(pilotWarning({ covered: 0, total: 0, missing: [], passed: true }), undefined);
});

test('warns about missing coverage without guessing how many lines are executable', () => {
    assert.equal(
        pilotWarning({ covered: 0, total: 0, missing: [source], passed: false }),
        '1 changed runtime TypeScript file is missing from the unit coverage report. Check the coverage scope; after the pilot, this will block PRs.'
    );
});

test('renders a marked PR comment for failures, passing PRs, and PRs without changed logic', () => {
    const failed = pilotComment({ covered: 2, total: 3, missing: [], passed: false });
    assert.match(failed, /^<!-- changed-typescript-coverage-pilot -->\n/);
    assert.match(failed, /### Unit-test coverage for changed code \(pilot\)/);
    assert.match(failed, /⚠️ \*\*66\.67%\*\* \(target: \*\*80%\*\*\)/);
    assert.match(failed, /> \[!WARNING\]\n> New code unit-test coverage is 66\.67%/);
    assert.match(
        failed,
        new RegExp(
            'Merging as-is leaves 1 changed executable line without unit coverage, ' +
                "weakening the project's quality safeguards and raising regression risk\\."
        )
    );
    assert.doesNotMatch(failed, /overall coverage decreased/);

    const passed = pilotComment({ covered: 4, total: 5, missing: [], passed: true });
    assert.match(passed, /✅ \*\*80\.00%\*\* \(target: \*\*80%\*\*\)/);
    assert.match(passed, /Result: pass/);
    assert.doesNotMatch(passed, /Merging as-is/);

    const noLines = pilotComment({ covered: 0, total: 0, missing: [], passed: true });
    assert.match(noLines, /ℹ️ \*\*N\/A\*\* \(no measurable changed runtime TypeScript lines\)/);
    assert.match(noLines, /Result: not applicable/);

    const incomplete = pilotComment({ covered: 0, total: 0, missing: [source], passed: false });
    assert.match(incomplete, /⚠️ \*\*N\/A\*\* \(coverage report incomplete; target: \*\*80%\*\*\)/);
    assert.match(incomplete, /missing from LCOV/);
});

test('pilot workflow uses unit coverage without gating the 80% comparison', () => {
    const workflow = readFileSync(join(import.meta.dirname, '../../.github/workflows/test-coverage.yml'), 'utf8');

    assert.match(workflow, /run: node --test scripts\/check-changed-coverage\/check\.test\.mjs/);
    assert.match(workflow, /run: pnpm run test:coverage:unit/);
    assert.match(workflow, /run: test -s coverage-unit\/lcov\.info/);
    assert.match(workflow, /continue-on-error: true/);
    assert.match(workflow, /name: Unit-test coverage for changed code \(pilot\)/);
    assert.match(workflow, /needs\.unit-tests\.outputs\.coverage_artifact == 'true'/);
    assert.match(workflow, /scripts\/check-changed-coverage\/check\.mjs/);
    assert.match(workflow, /persist-credentials: false/);
    assert.match(workflow, /actions\/upload-artifact@v4/);
    assert.match(workflow, /actions\/download-artifact@v4/);
    assert.match(workflow, /name: unit-coverage-\$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
    assert.match(workflow, /path: coverage-unit\/lcov\.info/);
    assert.match(workflow, /pull-requests: write/);
    assert.match(workflow, /group: changed-typescript-coverage-\$\{\{ github\.event\.pull_request\.number \}\}-\$\{\{ github\.event_name \}\}/);
    assert.match(workflow, /github\.rest\.issues\.deleteComment/);
    assert.match(workflow, /github\.rest\.issues\.createComment/);
    assert.doesNotMatch(workflow, /if: false|@connectis\/diff-test-coverage|lcov-reporter-action/);
});

test('pilot comment replaces only earlier pilot bot comments with a new comment', async () => {
    const workflow = readFileSync(join(import.meta.dirname, '../../.github/workflows/test-coverage.yml'), 'utf8');
    const script = workflow
        .split('script: |\n')[1]
        ?.split('\n    sonar-analysis:')[0]
        ?.replace(/^ {22}/gm, '');
    assert.ok(script);

    const marker = '<!-- changed-typescript-coverage-pilot -->';
    const comments = [
        { id: 1, user: { login: 'github-actions[bot]' }, body: `${marker}\nold result` },
        { id: 2, user: { login: 'github-actions[bot]' }, body: 'another workflow comment' },
        { id: 3, user: { login: 'someone-else' }, body: `${marker}\nnot ours` },
        { id: 4, user: { login: 'github-actions[bot]' }, body: `${marker}\nolder result` },
        { id: 5, user: { login: 'github-actions[bot]' }, body: `quoted ${marker}` },
    ];
    const calls = [];
    const context = { repo: { owner: 'example', repo: 'sdk' }, issue: { number: 42 } };
    const github = {
        paginate: async listComments => listComments(),
        rest: {
            issues: {
                listComments: () => comments,
                deleteComment: async ({ comment_id }) => calls.push(['delete', comment_id]),
                createComment: async ({ issue_number, body }) => calls.push(['create', issue_number, body]),
            },
        },
    };
    const require = () => ({ readFileSync: () => `${marker}\nnew result` });

    await runInNewContext(`(async () => { ${script} })()`, { context, github, require });

    assert.deepEqual(calls, [
        ['delete', 1],
        ['delete', 4],
        ['create', 42, `${marker}\nnew result`],
    ]);

    comments.length = 0;
    calls.length = 0;
    await runInNewContext(`(async () => { ${script} })()`, { context, github, require });
    assert.deepEqual(calls, [['create', 42, `${marker}\nnew result`]]);
});

test('coverage comparison uses the PR merge base rather than unrelated changes on the base branch', () => {
    const script = readFileSync(join(import.meta.dirname, 'check.mjs'), 'utf8');
    assert.match(script, /\$\{base\}\.\.\.\$\{head\}/);
    assert.doesNotMatch(script, /::warning/);
});

test('a writable PATH entry cannot replace the Git executable used for the diff', () => {
    const sha = execFileSync('/usr/bin/git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const directory = mkdtempSync(join(tmpdir(), 'changed-coverage-path-'));
    const originalPath = process.env.PATH;

    try {
        writeFileSync(join(directory, 'git'), '#!/bin/sh\nexit 86\n', { mode: 0o755 });
        process.env.PATH = `${directory}:${originalPath ?? ''}`;
        assert.equal(readChangedDiff(sha, sha), '');
    } finally {
        if (originalPath === undefined) delete process.env.PATH;
        else process.env.PATH = originalPath;
        rmSync(directory, { recursive: true, force: true });
    }
});
