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
            files.set(file, { hits: new Map(), branches: new Map() });
        } else if (line.startsWith('DA:') && file) {
            const match = /^DA:(\d+),(\d+)/.exec(line);
            if (match) files.get(file).hits.set(Number(match[1]), Number(match[2]));
        } else if (line.startsWith('BRDA:') && file) {
            const match = /^BRDA:(\d+),[^,]*,[^,]*,(\d+|-)$/.exec(line);
            if (!match) continue;
            const { branches } = files.get(file);
            const counts = branches.get(Number(match[1])) ?? { covered: 0, total: 0 };
            counts.total++;
            if (match[2] !== '-' && Number(match[2]) > 0) counts.covered++;
            branches.set(Number(match[1]), counts);
        } else if (line === 'end_of_record') {
            file = undefined;
        }
    }
    return files;
};

const plural = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`;

// SonarCloud's Coverage on New Code: (covered lines + covered conditions) / (lines to cover + conditions to cover).
const coveragePercent = ({ lines, conditions }) => ((lines.covered + conditions.covered) / (lines.total + conditions.total)) * 100;

export function analyzeChangedCoverage(diff, lcov) {
    const changed = changedLines(diff);
    const measured = measuredLines(lcov);
    const missing = [];
    const lines = { covered: 0, total: 0 };
    const conditions = { covered: 0, total: 0 };

    for (const [file, changedLineNumbers] of changed) {
        if (changedLineNumbers.size === 0) continue;
        const report = measured.get(file);
        if (!report) {
            missing.push(file);
            continue;
        }
        for (const line of changedLineNumbers) {
            if (report.hits.has(line)) {
                lines.total++;
                if (report.hits.get(line) > 0) lines.covered++;
            }
            const branch = report.branches.get(line);
            if (branch) {
                conditions.total += branch.total;
                conditions.covered += branch.covered;
            }
        }
    }

    // Like SonarCloud, small changes are measured by lines to cover only.
    const smallChange = lines.total < minimumLines;
    const meetsThreshold = smallChange || coveragePercent({ lines, conditions }) >= threshold;
    return { lines, conditions, missing, smallChange, passed: missing.length === 0 && meetsThreshold };
}

export function pilotWarning(analysis) {
    const { lines, conditions, missing, passed } = analysis;
    if (passed) return undefined;
    if (missing.length) {
        return `${missing.length} changed runtime TypeScript file${missing.length === 1 ? ' is' : 's are'} missing from the unit coverage report. Check the coverage scope; after the pilot, this will block PRs.`;
    }
    const uncoveredConditions = conditions.total - conditions.covered;
    const gaps = [
        plural(lines.total - lines.covered, 'changed executable line'),
        ...(uncoveredConditions ? [plural(uncoveredConditions, 'branch condition')] : []),
    ].join(' and ');
    return `New code unit-test coverage is ${coveragePercent(analysis).toFixed(2)}%, below the ${threshold}% target. Merging as-is leaves ${gaps} without unit coverage, weakening the project's quality safeguards and raising regression risk. After the pilot, PRs below ${threshold}% will be blocked.`;
}

export function pilotComment(analysis) {
    const { lines, conditions, missing, smallChange, passed } = analysis;
    const percentage = lines.total ? `**${coveragePercent(analysis).toFixed(2)}%**` : '';
    const coverageText =
        lines.total === 0
            ? missing.length
                ? `⚠️ **N/A** (coverage report incomplete; target: **${threshold}%**)`
                : 'ℹ️ **N/A** (no measurable changed runtime TypeScript lines)'
            : smallChange
              ? `${missing.length ? '⚠️' : 'ℹ️'} ${percentage} (${plural(lines.total, 'changed line')} to cover; the ${threshold}% target applies from ${minimumLines})`
              : `${passed ? '✅' : '⚠️'} ${percentage} (target: **${threshold}%**)`;
    const breakdown = lines.total
        ? [
              '',
              `Lines: ${lines.covered}/${lines.total} · Branch conditions: ${conditions.covered}/${conditions.total} · Computed like SonarCloud's Coverage on New Code.`,
          ]
        : [];
    const result = !passed
        ? 'below target or missing coverage'
        : lines.total === 0
          ? 'not applicable'
          : smallChange
            ? 'small change, target not applied'
            : 'pass';

    return [
        '<!-- changed-typescript-coverage-pilot -->',
        '### Unit-test coverage for changed code (pilot)',
        '',
        coverageText,
        ...breakdown,
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
