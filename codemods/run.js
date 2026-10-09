#!/usr/bin/env node
/**
 * v2-migration — runs the V1 → V2 codemods for @adyen/adyen-platform-experience-web
 * over the given paths, in a sensible order.
 *
 * Like ESLint and Stylelint, the CLI checks by default: it reports everything
 * it would change and leaves your files untouched. Pass --fix to apply.
 *
 * Usage:
 *   npx v2-migration [options] [files-or-directories...]   (defaults to ./src)
 *
 * Options handled here:
 *   --fix                    apply the changes (default is check-only)
 *   --only=<transform-name>  run a single transform instead of all of them
 *
 * Everything else passes through to jscodeshift (see `jscodeshift --help` for
 * the full list). Useful ones:
 *   --dry / --print          explicit dry run (same as the default behavior)
 *   --verbose=2              show per-file reports (REP lines)
 *   --extensions=ts,tsx      restrict which files are processed
 *
 * Examples:
 *   npx v2-migration                                   # check ./src
 *   npx v2-migration --fix                              # apply to ./src
 *   npx v2-migration --fix --only translations-keys --verbose=2 src/
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const requireFromHere = createRequire(import.meta.url);

const ALL_TRANSFORMS = ['fix-imports', 'core-init-options', 'component-props', 'translations-keys'];
const DEFAULT_EXTENSIONS = 'ts,tsx,js,jsx,mjs,cjs,vue';
const TODO_MARKER = 'TODO(v2-migration)';
const DRY_FLAGS = new Set(['--dry', '--dry=true', '--print', '--print=true']);

// Resolved from the consuming project, so the same run.js works inside this
// repo, in the published package (dist/codemods/), and in any package manager's
// hoisting layout.
function resolveDependency(specifier, hint) {
    try {
        return requireFromHere.resolve(specifier);
    } catch {
        console.error(hint);
        process.exit(1);
    }
}

function canResolveDependency(specifier) {
    try {
        requireFromHere.resolve(specifier);
        return true;
    } catch {
        return false;
    }
}

const args = process.argv.slice(2);

let only = null;
let fix = false;
const forward = [];
for (const arg of args) {
    if (arg.startsWith('--only=')) {
        only = arg.slice('--only='.length);
    } else if (arg === '--fix') {
        fix = true;
    } else {
        forward.push(arg);
    }
}

const transforms = only ? [only] : ALL_TRANSFORMS;
if (only && !ALL_TRANSFORMS.includes(only)) {
    console.error(`Unknown transform '${only}'. Available: ${ALL_TRANSFORMS.join(', ')}`);
    process.exit(1);
}

// The CLI checks by default. An explicit --dry/--print just makes that visible
// in jscodeshift's own output; --fix wins over any dry flag.
const explicitDryFlags = forward.filter(arg => DRY_FLAGS.has(arg));
if (fix && explicitDryFlags.length) {
    console.log('Conflicting flags: --fix together with --dry/--print. Applying changes (--fix wins).');
    for (const flag of explicitDryFlags) {
        forward.splice(forward.indexOf(flag), 1);
    }
}
if (!fix && explicitDryFlags.length === 0) {
    forward.push('--dry');
}

// No paths given: default to ./src (the common layout for SDK integrations).
if (!forward.some(arg => !arg.startsWith('-'))) {
    forward.push('src');
    console.log('No paths given — defaulting to ./src.\n');
    if (!existsSync('src')) {
        console.error('No ./src directory found. Pass the files or directories to migrate instead, e.g.:');
        console.error('  npx v2-migration --fix path/to/your/code');
        process.exit(1);
    }
}

// .vue Single-File Components need @vue/compiler-sfc. When it is not
// installed, skip .vue files instead of failing the whole run.
const userExtensionsArg = forward.find(arg => arg.startsWith('--extensions='));
const extensionList = (userExtensionsArg ? userExtensionsArg.slice('--extensions='.length) : DEFAULT_EXTENSIONS)
    .split(',')
    .map(extension => extension.trim())
    .filter(Boolean);

let effectiveExtensions = null;
if (extensionList.includes('vue') && !canResolveDependency('@vue/compiler-sfc')) {
    const keptExtensions = extensionList.filter(extension => extension !== 'vue');
    console.log('Skipping .vue files: @vue/compiler-sfc is not installed.');
    console.log('To also migrate Vue Single-File Components, install it as a dev dependency and re-run:');
    console.log('  npm install --save-dev @vue/compiler-sfc\n');
    effectiveExtensions = keptExtensions.length ? `--extensions=${keptExtensions.join(',')}` : null;
}

// Sensible defaults for SDK integrations (TypeScript-heavy consumers,
// including Vue Single-File Components). Users can override by passing
// their own flags.
const cliArgs = [...forward];
if (effectiveExtensions) {
    for (let i = cliArgs.length - 1; i >= 0; i--) {
        if (String(cliArgs[i]).startsWith('--extensions=')) {
            cliArgs.splice(i, 1);
        }
    }
    cliArgs.push(effectiveExtensions);
} else if (!cliArgs.some(arg => arg.startsWith('--extensions='))) {
    cliArgs.push(`--extensions=${DEFAULT_EXTENSIONS}`);
}
if (!cliArgs.some(arg => arg.startsWith('--ignore='))) {
    cliArgs.push('--ignore=**/node_modules/**');
}
if (!cliArgs.some(arg => arg.startsWith('--fail-on-error'))) {
    cliArgs.push('--fail-on-error');
}

console.log(fix ? 'Applying changes (--fix).' : 'Checking only — no files will be written. Pass --fix to apply the changes.');

const jscodeshiftCli = resolveDependency('jscodeshift/bin/jscodeshift.js', [
    'jscodeshift is required to run the migration. Install it as a dev dependency, then re-run:',
    '  npm install --save-dev jscodeshift    # or the pnpm / yarn / bun equivalent',
].join('\n'));

/**
 * Parse jscodeshift's results block, which spans several lines:
 *
 *   Results:
 *   0 errors
 *   0 unmodified
 *   0 skipped
 *   1 ok
 *   Time elapsed: 0.265seconds
 *
 * "ok" is the changed-file count (jscodeshift 17 uses it in both dry and write
 * modes; older versions said "modified" instead).
 */
function parseStats(output) {
    const lines = output.split('\n');
    const resultsIndex = lines.findLastIndex(line => line.trim().startsWith('Results:'));
    if (resultsIndex === -1) {
        return { changed: 0, errors: 0, skipped: 0 };
    }

    const counts = {};
    const pattern = /^(\d+)\s+(errors?|unmodified|skipped|ok|modified)\b/;
    for (const line of lines.slice(resultsIndex + 1, resultsIndex + 6)) {
        const match = pattern.exec(line.trim());
        if (!match) break;
        counts[match[2].replace(/s$/, '')] = Number(match[1]);
    }

    return {
        changed: counts.ok ?? counts.modified ?? 0,
        errors: counts.error ?? 0,
        skipped: counts.skipped ?? 0,
    };
}

/** Count migration markers across the processed paths (dry runs see markers left by earlier --fix runs). */
function countTodoMarkers(paths, extensions) {
    const suffixes = new Set(extensions.map(extension => (extension.startsWith('.') ? extension : `.${extension}`)));
    let count = 0;

    const visit = path => {
        let stats;
        try {
            stats = statSync(path);
        } catch {
            return;
        }
        if (stats.isDirectory()) {
            if (basename(path) === 'node_modules') return;
            let entries;
            try {
                entries = readdirSync(path);
            } catch {
                return; // unreadable directory
            }
            for (const entry of entries) {
                visit(join(path, entry));
            }
        } else if (stats.isFile() && (suffixes.size === 0 || suffixes.has(extname(path)))) {
            try {
                count += readFileSync(path, 'utf8').split(TODO_MARKER).length - 1;
            } catch {
                // Ignore files that cannot be read
            }
        }
    };

    for (const path of paths) {
        visit(resolve(path));
    }
    return count;
}

const results = [];
for (const name of transforms) {
    const transformPath = join(here, 'transforms', `${name}.cjs`);
    console.log(`\n>>> ${name}`);
    const result = spawnSync(process.execPath, [jscodeshiftCli, '-t', transformPath, ...cliArgs], {
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
    });
    if (result.error) {
        console.error(`\nFailed to start transform '${name}':`, result.error);
        process.exit(1);
    }
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) {
        console.error(`\nTransform '${name}' failed — fix the reported errors and re-run.`);
        process.exit(result.status ?? 1);
    }
    results.push({ name, ...parseStats(result.stdout ?? '') });
}

const totalChanged = results.reduce((sum, result) => sum + result.changed, 0);
const totalErrors = results.reduce((sum, result) => sum + result.errors, 0);
const todoCount = countTodoMarkers(forward.filter(arg => !arg.startsWith('-')), extensionList);

console.log('\n=== v2-migration summary ===');
for (const result of results) {
    console.log(`  ${result.name}: ${result.changed} ${fix ? 'changed' : 'would change'}, ${result.errors} errors, ${result.skipped} skipped`);
}
if (todoCount > 0) {
    console.log(`  ${todoCount} ${TODO_MARKER} marker(s) found in the processed code`);
}

console.log('\nNext steps:');
if (!fix) {
    console.log('  - review the report above, then re-run with --fix to apply the changes');
}
if (todoCount > 0) {
    console.log(`  - resolve every ${TODO_MARKER} marker the codemods left behind (grep -rn "${TODO_MARKER}" <your-paths>)`);
}
if (totalErrors > 0) {
    console.log('  - fix the errors reported above, then re-run');
}
console.log('  - run your formatter, type checker, and test suite on the migrated code');
