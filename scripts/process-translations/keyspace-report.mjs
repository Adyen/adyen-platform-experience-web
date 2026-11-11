import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GIT_BIN, SAFE_ENV } from './safe-env.mjs';

// Reports the translation keyspace diff and measurement deltas between the
// merge base and the working tree — proposal T1 of the keyspace optimization
// document (local-only), in the spirit of the bundle-size PR check: the diff
// is the merchant-facing API surface, so removed keys are the breaking-change
// signal a reviewer needs (removals require the N6 alias/major-version
// decision). Report only: the exit status is always success unless the inputs
// are wrong, never because of what the diff says.
//
// The en-US catalogs are the diff surface because locale key sets are
// identical; value deltas are reported with their x11-locale multiplier. The
// renamed pairs use a value-identity heuristic: a removed key whose exact
// value reappears under an added key is a rename, which is what the keyspace
// migrations produce and cheap to eyeball on a review.

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const commandArguments = process.argv.slice(2);
const rootArgument = commandArguments.find(argument => argument.startsWith('--root='))?.slice('--root='.length);
const projectRoot = rootArgument ? path.resolve(rootArgument) : path.resolve(scriptDirectory, '../..');
const baseRevision = commandArguments.find(argument => !argument.startsWith('--'));

const CATALOGS = [
    { path: 'packages/sdk/translations/en-US.json', name: 'SDK merged catalog (the merchant-facing keyspace)' },
    { path: 'packages/sdk/translations/bento/en-US.json', name: 'Bento mirror catalog' },
];

// The enum-mirror subtree share from the measurement appendix. Both the
// pre-N2a (`...common.defense*`) and landed (`disputes.management.defense*`)
// shapes match, so a base and a head on opposite sides of the rename measure
// the same subtree.
const ENUM_MIRROR_PATTERN = /^disputes\.management\.(?:common\.)?defense(?:Reasons|Documents)\./;
const LOCALE_MULTIPLIER = 11;
const SAMPLE_LIMIT = 5;

// CLI tool output; one sanctioned console call site per stream.
const log = (...args) => console.log(...args); // NOSONAR: CLI report output
const logError = (...args) => console.error(...args); // NOSONAR: CLI report output

const git = args => execFileSync(GIT_BIN, args, { cwd: projectRoot, encoding: 'utf8', env: SAFE_ENV });

const readJsonFile = async relativePath => JSON.parse(await readFile(path.join(projectRoot, relativePath), 'utf8'));

const readJsonAtRevision = (revision, relativePath) => {
    try {
        return { exists: true, value: JSON.parse(git(['show', `${revision}:${relativePath}`])) };
    } catch {
        return { exists: false, value: {} };
    }
};

const namespaceOf = key => key.split('.')[0];

// Splits the base/head key sets into added, removed, and value-identical
// renamed pairs. Pairing is greedy on the removed side against a value index
// of the added keys; unmatched keys stay in the added and removed buckets.
const diffKeys = (base, head) => {
    const added = Object.keys(head).filter(key => !(key in base));
    const removed = Object.keys(base).filter(key => !(key in head));
    const addedByValue = new Map();
    for (const newKey of added) {
        const bucket = addedByValue.get(head[newKey]) ?? [];
        bucket.push(newKey);
        addedByValue.set(head[newKey], bucket);
    }

    const renamed = [];
    const pairedAdded = new Set();
    const removedLeft = [];
    for (const oldKey of removed) {
        const match = addedByValue.get(base[oldKey])?.shift();
        if (match === undefined) {
            removedLeft.push(oldKey);
            continue;
        }
        renamed.push([oldKey, match]);
        pairedAdded.add(match);
    }

    const valuesChanged = Object.keys(head).filter(key => key in base && head[key] !== base[key]);
    return { added: added.filter(key => !pairedAdded.has(key)), removed: removedLeft, renamed, valuesChanged };
};

const measurementsOf = catalog => {
    const keys = Object.keys(catalog);
    const keyBytes = keys.reduce((sum, key) => sum + key.length, 0);
    const valueBytes = keys.reduce((sum, key) => sum + String(catalog[key]).length, 0);
    const enumMirrorBytes = keys.filter(key => ENUM_MIRROR_PATTERN.test(key)).reduce((sum, key) => sum + key.length, 0);
    return {
        keys: keys.length,
        keyBytes,
        valueBytes,
        avgKeyLength: keys.length > 0 ? keyBytes / keys.length : 0,
        maxDepth: keys.reduce((depth, key) => Math.max(depth, key.split('.').length), 0),
        enumMirrorShare: keyBytes > 0 ? (100 * enumMirrorBytes) / keyBytes : 0,
    };
};

const byNamespace = keys => {
    const counts = new Map();
    for (const key of keys) counts.set(namespaceOf(key), (counts.get(namespaceOf(key)) ?? 0) + 1);
    return [...counts.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([ns, count]) => `${ns} ${count}`)
        .join(', ');
};

const sample = keys =>
    keys
        .slice(0, SAMPLE_LIMIT)
        .map(key => `    ${key}`)
        .join('\n');

const printDiff = ({ added, removed, renamed, valuesChanged }) => {
    const renamedPairs = renamed.map(([from, to]) => `${from} -> ${to}`);
    log(`  added: ${added.length} (${byNamespace(added) || 'none'})`);
    if (added.length > 0) log(sample(added));
    log(`  removed: ${removed.length} (${byNamespace(removed) || 'none'}) — breaking: removals need the alias/major-version decision`);
    if (removed.length > 0) log(sample(removed));
    log(`  renamed: ${renamed.length} (${byNamespace(renamed.map(([, to]) => to)) || 'none'}) — value-identical pairs`);
    if (renamedPairs.length > 0)
        log(
            renamedPairs
                .slice(0, SAMPLE_LIMIT)
                .map(pair => `    ${pair}`)
                .join('\n')
        );
    log(`  values changed: ${valuesChanged.length} (${byNamespace(valuesChanged) || 'none'})`);
};

const kilobytes = bytes => `${(bytes / 1024).toFixed(1)} KB`;
const signed = delta => (delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1));

const printMeasurements = (base, head) => {
    log('  measurements                base        head      delta');
    log(
        `  keys                     ${String(base.keys).padStart(7)}  ${String(head.keys).padStart(10)}  ${String(head.keys - base.keys).padStart(8)}`
    );
    log(
        `  key bytes          ${kilobytes(base.keyBytes).padStart(9)}  ${kilobytes(head.keyBytes).padStart(10)}  ` +
            `${signed((head.keyBytes - base.keyBytes) / 1024).padStart(8)} (x11 locales: ${signed(((head.keyBytes - base.keyBytes) * LOCALE_MULTIPLIER) / 1024)} KB)`
    );
    log(
        `  value bytes        ${kilobytes(base.valueBytes).padStart(9)}  ${kilobytes(head.valueBytes).padStart(10)}  ` +
            `${signed((head.valueBytes - base.valueBytes) / 1024).padStart(8)} (x11 locales: ${signed(((head.valueBytes - base.valueBytes) * LOCALE_MULTIPLIER) / 1024)} KB)`
    );
    log(
        `  avg key length         ${base.avgKeyLength.toFixed(1).padStart(7)}  ${head.avgKeyLength.toFixed(1).padStart(10)}  ` +
            `${signed(head.avgKeyLength - base.avgKeyLength).padStart(8)}`
    );
    log(
        `  max depth                  ${String(base.maxDepth).padStart(3)}  ${String(head.maxDepth).padStart(10)}  ${String(head.maxDepth - base.maxDepth).padStart(8)}`
    );
    log(
        `  enum-mirror share      ${base.enumMirrorShare.toFixed(1).padStart(6)}%  ${head.enumMirrorShare.toFixed(1).padStart(9)}%  ` +
            `${signed(head.enumMirrorShare - base.enumMirrorShare).padStart(7)}pp`
    );
};

const main = async () => {
    if (!baseRevision || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(baseRevision)) {
        logError('Base revision must be a plain git reference such as "origin/main".');
        process.exitCode = 1;
        return;
    }
    let mergeBase;
    try {
        mergeBase = git(['merge-base', 'HEAD', baseRevision]).trim();
    } catch {
        logError(`No merge base found for ${baseRevision}; fetch the ref first.`);
        process.exitCode = 1;
        return;
    }

    log(`translation keyspace report: ${baseRevision} (merge base ${mergeBase.slice(0, 10)}) -> HEAD\n`);
    for (const { path: catalogPath, name } of CATALOGS) {
        log(`${name}`);
        const baseState = readJsonAtRevision(mergeBase, catalogPath);
        if (!baseState.exists) {
            log('  not present in the merge base; grandfathering the initial catalog.\n');
            continue;
        }
        const head = await readJsonFile(catalogPath);
        printDiff(diffKeys(baseState.value, head));
        printMeasurements(measurementsOf(baseState.value), measurementsOf(head));
        log('');
    }
};

await main();
