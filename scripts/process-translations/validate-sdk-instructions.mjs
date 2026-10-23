import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GIT_BIN, SAFE_ENV } from './safe-env.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const commandArguments = process.argv.slice(2);
const rootArgument = commandArguments.find(argument => argument.startsWith('--root='))?.slice('--root='.length);
const projectRoot = rootArgument ? path.resolve(rootArgument) : path.resolve(scriptDirectory, '../..');
const baseRevision = commandArguments.find(argument => !argument.startsWith('--'));

const SDK_CATALOGS = [
    {
        catalog: 'packages/sdk/translations/en-US.json',
        instructions: 'packages/sdk/translations/en-US.instructions.json',
        name: 'SDK',
    },
    {
        catalog: 'packages/sdk/translations/bento/en-US.json',
        instructions: 'packages/sdk/translations/bento/en-US.instructions.json',
        name: 'SDK Bento',
    },
];

const readJsonFile = filePath => JSON.parse(readFileSync(path.join(projectRoot, filePath), 'utf8'));

const readJsonAtRevision = (revision, filePath) => {
    try {
        return {
            exists: true,
            value: JSON.parse(
                execFileSync(GIT_BIN, ['show', `${revision}:${filePath}`], {
                    cwd: projectRoot,
                    encoding: 'utf8',
                    env: SAFE_ENV,
                    stdio: ['ignore', 'pipe', 'ignore'],
                })
            ),
        };
    } catch {
        return { exists: false, value: {} };
    }
};

// The revision comes from the CI command line ("origin/${BASE_REF}", where BASE_REF is the PR base
// branch) and is passed as a git argument: reject anything git could interpret as an option.
if (!baseRevision || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(baseRevision)) {
    throw new Error('Base revision must be a plain git reference such as "origin/main".');
}

const mergeBase = execFileSync(GIT_BIN, ['merge-base', 'HEAD', baseRevision], { cwd: projectRoot, encoding: 'utf8', env: SAFE_ENV }).trim();
const failures = [];
let changedKeyCount = 0;

// Base keys that carry the same English value as `key` and are absent from the
// current catalog: the rename sources of a key the grammar migration renamed.
// A rename keeps the English text, so it is not new English text: it needs no
// new instruction, and an instruction the source key had must be rekeyed to
// the new name (a leftover under the old name is reported as an orphan).
const findRenameSources = (key, value, baseKeysByValue, currentKeys) =>
    (baseKeysByValue.get(value) ?? []).filter(baseKey => baseKey !== key && !currentKeys.has(baseKey));

// Indexes the base catalog by English value, so a renamed key can find the
// keys it may have been renamed from.
const indexBaseKeysByValue = baseCatalog => {
    const baseKeysByValue = new Map();
    for (const [baseKey, baseValue] of Object.entries(baseCatalog)) {
        if (!baseKeysByValue.has(baseValue)) baseKeysByValue.set(baseValue, []);
        baseKeysByValue.get(baseValue).push(baseKey);
    }
    return baseKeysByValue;
};

const reportOrphanInstructions = (instructions, catalog, name, failures) => {
    for (const key of Object.keys(instructions)) {
        if (!(key in catalog)) {
            failures.push(`${key}: remove the ${name} translation instruction because it has no matching English translation entry.`);
        }
    }
};

const reportChangedKeyFailures = (changedKeys, context, failures) => {
    const { catalog, instructions, baseCatalog, baseInstructions, name, baseKeysByValue, currentKeys } = context;
    for (const key of changedKeys) {
        const instruction = instructions[key];
        const isRename = !(key in baseCatalog) && findRenameSources(key, catalog[key], baseKeysByValue, currentKeys).length > 0;

        if (!instruction) {
            if (isRename) continue;
            failures.push(`${key}: add an ${name} translation instruction.`);
            continue;
        }

        if (key in baseCatalog && instruction === baseInstructions[key]) {
            failures.push(`${key}: update its ${name} translation instruction for the modified English text.`);
        }
    }
};

const checkCatalog = ({ catalog, instructions, baseCatalog, baseInstructions, name }, failures) => {
    reportOrphanInstructions(instructions, catalog, name, failures);

    const changedKeys = Object.keys(catalog).filter(key => catalog[key] !== baseCatalog[key]);
    reportChangedKeyFailures(
        changedKeys,
        {
            catalog,
            instructions,
            baseCatalog,
            baseInstructions,
            name,
            baseKeysByValue: indexBaseKeysByValue(baseCatalog),
            currentKeys: new Set(Object.keys(catalog)),
        },
        failures
    );

    return changedKeys.length;
};

for (const sdkCatalog of SDK_CATALOGS) {
    const catalog = readJsonFile(sdkCatalog.catalog);
    const instructions = readJsonFile(sdkCatalog.instructions);
    const baseCatalogAtMergeBase = readJsonAtRevision(mergeBase, sdkCatalog.catalog);

    if (!baseCatalogAtMergeBase.exists) {
        // No base catalog means no diff to check; the instructions still have
        // to match the current catalog, so run that half alone.
        checkCatalog({ catalog, instructions, baseCatalog: catalog, baseInstructions: instructions, name: sdkCatalog.name }, failures);
        console.log(`${sdkCatalog.name} English catalog is not present in the merge base; grandfathering this initial catalog.`);
        continue;
    }

    const baseInstructionsAtMergeBase = readJsonAtRevision(mergeBase, sdkCatalog.instructions);
    changedKeyCount += checkCatalog(
        {
            catalog,
            instructions,
            baseCatalog: baseCatalogAtMergeBase.value,
            baseInstructions: baseInstructionsAtMergeBase.value,
            name: sdkCatalog.name,
        },
        failures
    );
}

if (failures.length > 0) {
    console.error('SDK English translation changes require matching instruction changes:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log(`Validated SDK instructions for ${changedKeyCount} new or modified English translation entries.`);
