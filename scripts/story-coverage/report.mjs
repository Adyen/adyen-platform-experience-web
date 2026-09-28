import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const DEFAULT_INDEX_PATH = 'packages/tools/storybook/storybook-static/index.json';
const PASSING_OUTCOMES = new Set(['expected', 'flaky']);

const isInScope = entry => entry.type === 'story' && !entry.id.startsWith('api-');

export const domainOf = importPath => {
    if (!importPath) return 'other';
    return /(?:^|\/)domains\/([^/]+)\//.exec(importPath)?.[1] ?? (/(?:^|\/)sdk\//.test(importPath) ? 'sdk' : 'other');
};

export const summarize = (index, { testFiles, visits }) => {
    const entries = Object.values(index.entries ?? index.stories ?? {});
    const knownIds = new Set(entries.map(({ id }) => id));
    const domainsInRun = new Set(testFiles.map(domainOf));
    const passed = new Set(visits.filter(({ outcome }) => PASSING_OUTCOMES.has(outcome)).map(({ storyId }) => storyId));
    const visited = new Set(visits.map(({ storyId }) => storyId));
    const domains = new Map();

    for (const { id, importPath } of entries.filter(isInScope).sort((a, b) => a.id.localeCompare(b.id))) {
        const domain = domainOf(importPath);
        if (!domains.has(domain))
            domains.set(domain, { domain, ran: domainsInRun.has(domain), stories: 0, covered: 0, failingOnly: [], uncovered: [] });
        const row = domains.get(domain);
        row.stories++;
        if (!row.ran) continue;
        if (passed.has(id)) row.covered++;
        else (visited.has(id) ? row.failingOnly : row.uncovered).push(id);
    }

    const rows = [...domains.values()].sort((a, b) => a.domain.localeCompare(b.domain));
    const ranRows = rows.filter(row => row.ran);
    const sum = pick => ranRows.reduce((total, row) => total + pick(row), 0);

    return {
        totals: {
            stories: sum(row => row.stories),
            covered: sum(row => row.covered),
            failingOnly: sum(row => row.failingOnly.length),
            uncovered: sum(row => row.uncovered.length),
        },
        domains: rows,
        domainsNotRun: rows.filter(row => !row.ran).map(row => row.domain),
        unknownStories: [...visited].filter(id => !knownIds.has(id)).sort(),
    };
};

const percent = (covered, stories) => (stories ? `${((covered / stories) * 100).toFixed(1)}%` : '—');

export const formatMarkdown = ({ totals, domains, domainsNotRun, unknownStories }) => {
    const lines = [
        '## Story coverage',
        '',
        'A story is covered when at least one Playwright test that opened it passed (a pass after retry counts; the test is flaky). This measures scenarios, not source lines. Real-API (`api-*`) stories are excluded.',
        '',
        '| Domain | Stories | Covered | % | Only failing/skipped tests | No test |',
        '| --- | ---: | ---: | ---: | ---: | ---: |',
        ...domains.map(row =>
            row.ran
                ? `| ${row.domain} | ${row.stories} | ${row.covered} | ${percent(row.covered, row.stories)} | ${row.failingOnly.length} | ${row.uncovered.length} |`
                : `| ${row.domain} | ${row.stories} | — | not run | — | — |`
        ),
        `| **Total** | **${totals.stories}** | **${totals.covered}** | **${percent(totals.covered, totals.stories)}** | **${totals.failingOnly}** | **${totals.uncovered}** |`,
    ];

    if (domainsNotRun.length) lines.push('', `_Not in this run: ${domainsNotRun.join(', ')}. Excluded from the total._`);

    const missing = domains.filter(row => row.failingOnly.length || row.uncovered.length);
    if (missing.length) {
        lines.push('', `<details><summary>Stories without a passing test (${totals.failingOnly + totals.uncovered})</summary>`, '');
        for (const row of missing) {
            lines.push(`**${row.domain}**`, '');
            lines.push(...row.uncovered.map(id => `- \`${id}\` — no test`));
            lines.push(...row.failingOnly.map(id => `- \`${id}\` — only failing or skipped tests`));
            lines.push('');
        }
        lines.push('</details>');
    }

    if (unknownStories.length) {
        lines.push('', `**Tests opened ${unknownStories.length} story ID(s) missing from the Storybook index:**`, '');
        lines.push(...unknownStories.map(id => `- \`${id}\``));
    }

    return `${lines.join('\n')}\n`;
};

export const readRuns = inputDir => {
    const files = existsSync(inputDir) ? readdirSync(inputDir).filter(file => /^visited(?:-.+)?\.json$/.test(file)) : [];
    if (!files.length) throw new Error(`No visited-*.json files in ${inputDir}. Run the Playwright integration tests first.`);
    const runs = files.sort().map(file => JSON.parse(readFileSync(join(inputDir, file), 'utf8')));
    return {
        testFiles: [...new Set(runs.flatMap(({ testFiles }) => testFiles ?? []))],
        visits: runs.flatMap(({ visits }) => visits ?? []),
    };
};

/** Resolves a CLI path and rejects it unless it stays inside `root`, so arguments cannot read or write elsewhere. */
const resolveInside = (root, path, option) => {
    const resolved = resolve(root, path);
    const fromRoot = relative(root, resolved);
    if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) throw new Error(`--${option} must be inside ${root}: ${path}`);
    return resolved;
};

export const run = (argv, { log = console.log, cwd = process.cwd(), env = process.env } = {}) => {
    const { values } = parseArgs({
        args: argv,
        options: { index: { type: 'string', default: DEFAULT_INDEX_PATH }, input: { type: 'string', default: 'story-coverage' } },
    });
    const indexPath = resolveInside(cwd, values.index, 'index');
    const inputDir = resolveInside(cwd, values.input, 'input');
    if (!existsSync(indexPath)) throw new Error(`Storybook index.json not found at ${indexPath}. Build Storybook first or pass --index.`);

    const summary = summarize(JSON.parse(readFileSync(indexPath, 'utf8')), readRuns(inputDir));
    const markdown = formatMarkdown(summary);
    writeFileSync(join(inputDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
    // The step summary path comes from the GitHub runner, not from CLI arguments.
    if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, markdown);
    log(markdown);
    return summary;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        run(process.argv.slice(2));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
