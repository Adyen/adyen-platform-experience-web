import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const threshold = 80;
// Like Sonar's small-change rule: the threshold applies only from this many changed executable lines.
const minimumLines = 20;
const sourceRoots = [
    /^src\/.+\.ts$/,
    /^packages\/sdk\/src\/.+\.ts$/,
    /^packages\/domains\/[^/]+\/(?:domain|vue)\/src\/.+\.ts$/,
    /^packages\/shared\/(?:composables-vue|core|utils)\/src\/.+\.ts$/,
];

const isRuntimeTypeScript = file =>
    sourceRoots.some(root => root.test(file)) &&
    !/(?:^|\/)(?:testing|__testing__)\//.test(file) &&
    !/(?:^|\/)(?:index|constants|types)\.ts$/.test(file) &&
    !/\.(?:test|spec|stories|d)\.ts$/.test(file);

const normalizePath = file => (isAbsolute(file) ? relative(process.cwd(), file) : file.replace(/^\.\//, ''));

const changedLines = diff => {
    const files = new Map();
    let file;
    let lineNumber;

    for (const line of diff.split('\n')) {
        if (line.startsWith('diff --git ')) {
            file = undefined;
            lineNumber = undefined;
        } else if (line.startsWith('+++ b/')) {
            const path = line.slice(6);
            file = isRuntimeTypeScript(path) ? path : undefined;
            if (file && !files.has(file)) files.set(file, new Set());
        } else if (line.startsWith('@@ ')) {
            const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
            lineNumber = hunk ? Number(hunk[1]) : undefined;
        } else if (file && lineNumber !== undefined) {
            if (line.startsWith('+')) {
                files.get(file).add(lineNumber++);
            } else if (line.startsWith(' ')) {
                lineNumber++;
            }
        }
    }
    return files;
};

const measuredLines = lcov => {
    const files = new Map();
    let file;

    for (const line of lcov.split('\n')) {
        if (line.startsWith('SF:')) {
            file = normalizePath(line.slice(3));
            files.set(file, new Map());
        } else if (line.startsWith('DA:') && file) {
            const match = /^DA:(\d+),(\d+)/.exec(line);
            if (match) files.get(file).set(Number(match[1]), Number(match[2]));
        } else if (line === 'end_of_record') {
            file = undefined;
        }
    }
    return files;
};

export function analyzeChangedCoverage(diff, lcov) {
    const changed = changedLines(diff);
    const measured = measuredLines(lcov);
    const missing = [];
    let covered = 0;
    let total = 0;

    for (const [file, lines] of changed) {
        if (lines.size === 0) continue;
        const counts = measured.get(file);
        if (!counts) {
            missing.push(file);
            continue;
        }
        for (const line of lines) {
            if (!counts.has(line)) continue;
            total++;
            if (counts.get(line) > 0) covered++;
        }
    }

    const smallChange = total < minimumLines;
    return { covered, total, missing, smallChange, passed: missing.length === 0 && (smallChange || covered * 100 >= threshold * total) };
}

export function pilotWarning({ covered, total, missing, passed }) {
    if (passed) return undefined;
    if (missing.length) {
        return `${missing.length} changed runtime TypeScript file${missing.length === 1 ? ' is' : 's are'} missing from the unit coverage report. Check the coverage scope; after the pilot, this will block PRs.`;
    }
    return `New code unit-test coverage is ${((covered / total) * 100).toFixed(2)}%, below the ${threshold}% target. Merging as-is leaves ${total - covered} changed executable line${total - covered === 1 ? '' : 's'} without unit coverage, weakening the project's quality safeguards and raising regression risk. After the pilot, PRs below ${threshold}% will be blocked.`;
}

export function pilotComment(analysis) {
    const { covered, total, missing, smallChange, passed } = analysis;
    const percentage = total ? `**${((covered / total) * 100).toFixed(2)}%**` : '';
    const coverageText =
        total === 0
            ? missing.length
                ? `⚠️ **N/A** (coverage report incomplete; target: **${threshold}%**)`
                : 'ℹ️ **N/A** (no measurable changed runtime TypeScript lines)'
            : smallChange
              ? `${missing.length ? '⚠️' : 'ℹ️'} ${percentage} (${total} changed executable line${total === 1 ? '' : 's'}; the ${threshold}% target applies from ${minimumLines})`
              : `${passed ? '✅' : '⚠️'} ${percentage} (target: **${threshold}%**)`;
    const result = !passed
        ? 'below target or missing coverage'
        : total === 0
          ? 'not applicable'
          : smallChange
            ? 'small change, target not applied'
            : 'pass';

    return [
        '<!-- changed-typescript-coverage-pilot -->',
        '### Unit-test coverage for changed code (pilot)',
        '',
        coverageText,
        ...(missing.length ? ['', 'Changed source files missing from LCOV:', ...missing.map(file => `- \`${file}\``)] : []),
        '',
        `Result: ${result}. Vue components require separate Playwright checks.`,
        ...(!passed ? ['', '> [!WARNING]', `> ${pilotWarning(analysis)}`] : []),
        '',
        'The 80% comparison is advisory during the pilot. It will become a required check after the pilot is validated.',
    ].join('\n');
}

export function readChangedDiff(base, head) {
    return execFileSync('/usr/bin/git', ['diff', '--no-ext-diff', '--unified=0', `${base}...${head}`, '--'], {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PATH: '/usr/bin:/bin' },
    });
}

function main() {
    const [base, head] = process.argv.slice(2);
    if (![base, head].every(sha => /^[a-f0-9]{40}$/.test(sha ?? ''))) {
        throw new Error('Expected the base and PR head commit SHAs');
    }

    const diff = readChangedDiff(base, head);
    const report = readFileSync('coverage-unit/lcov.info', 'utf8');
    const analysis = analyzeChangedCoverage(diff, report);
    const message = pilotComment(analysis);

    console.log(message);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${message}\n`);
    writeFileSync('coverage-unit/pr-comment.md', `${message}\n`);
    if (!analysis.passed) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
