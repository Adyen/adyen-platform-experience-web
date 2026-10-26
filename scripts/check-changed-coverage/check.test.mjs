import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { analyzeChangedCoverage, readChangedDiff } from './check.mjs';

const source = 'packages/domains/example/domain/src/Feature/rule.ts';
const patch = (file, count) => `diff --git a/${file} b/${file}\n--- /dev/null\n+++ b/${file}\n@@ -0,0 +1,${count} @@\n${'+line\n'.repeat(count)}`;
const lcov = (lines, coveredLines, branches = []) =>
    [
        `SF:${source}`,
        ...Array.from({ length: lines }, (_, i) => `DA:${i + 1},${i < coveredLines ? 1 : 0}`),
        ...branches.map((taken, i) => `BRDA:1,0,${i},${taken}`),
        'end_of_record',
    ].join('\n');
const check = (lines, coveredLines, branches) => analyzeChangedCoverage(patch(source, lines), lcov(lines, coveredLines, branches));

test('passes at 80% of changed lines and fails below', () => {
    assert.equal(check(20, 16).passed, true);
    assert.equal(check(20, 15).passed, false);
});

test('combines lines and branch conditions like SonarCloud', () => {
    const result = check(20, 17, [1, 0, '-', 0]);
    assert.deepEqual(result.conditions, { covered: 1, total: 4 });
    assert.equal(result.passed, false);
});

test('does not apply the threshold below 20 changed lines to cover', () => {
    const result = check(19, 0, [0, 0]);
    assert.equal(result.smallChange, true);
    assert.equal(result.passed, true);
});

test('fails when a changed runtime file is missing from the coverage report', () => {
    const result = analyzeChangedCoverage(patch(source, 3), '');
    assert.deepEqual(result.missing, [source]);
    assert.equal(result.passed, false);
});

test('ignores Vue, test, excluded, and out-of-scope files', () => {
    const files = ['vue/src/F/Filters.vue', 'domain/src/F/rule.test.ts', 'domain/src/F/index.ts', 'domain/src/F/testing/x.ts'].map(
        file => `packages/domains/example/${file}`
    );
    const diff = [...files, 'packages/shared/types/src/api.ts', 'scripts/helper.ts'].map(file => patch(file, 1)).join('');
    assert.deepEqual(analyzeChangedCoverage(diff, ''), analyzeChangedCoverage('', ''));
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
        process.env.PATH = originalPath;
        rmSync(directory, { recursive: true, force: true });
    }
});
