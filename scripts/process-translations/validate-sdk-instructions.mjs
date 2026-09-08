import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

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

const readJsonFile = filePath => JSON.parse(readFileSync(filePath, 'utf8'));

const readJsonAtRevision = (revision, filePath) => {
    try {
        return {
            exists: true,
            value: JSON.parse(execFileSync('git', ['show', `${revision}:${filePath}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })),
        };
    } catch {
        return { exists: false, value: {} };
    }
};

const baseRevision = process.argv[2];

if (!baseRevision) {
    throw new Error('Usage: node scripts/process-translations/validate-sdk-instructions.mjs <base-revision>');
}

const mergeBase = execFileSync('git', ['merge-base', 'HEAD', baseRevision], { encoding: 'utf8' }).trim();
const failures = [];
let changedKeyCount = 0;

for (const { catalog: catalogPath, instructions: instructionsPath, name } of SDK_CATALOGS) {
    const catalog = readJsonFile(catalogPath);
    const instructions = readJsonFile(instructionsPath);
    const baseCatalogAtMergeBase = readJsonAtRevision(mergeBase, catalogPath);
    const instructionKeysWithoutCatalogEntries = Object.keys(instructions).filter(key => !(key in catalog));

    for (const key of instructionKeysWithoutCatalogEntries) {
        failures.push(`${key}: remove the ${name} translation instruction because it has no matching English translation entry.`);
    }

    if (!baseCatalogAtMergeBase.exists) {
        console.log(`${name} English catalog is not present in the merge base; grandfathering this initial catalog.`);
        continue;
    }

    const baseInstructionsAtMergeBase = readJsonAtRevision(mergeBase, instructionsPath);
    const baseCatalog = baseCatalogAtMergeBase.value;
    const baseInstructions = baseInstructionsAtMergeBase.value;
    const changedKeys = Object.keys(catalog).filter(key => catalog[key] !== baseCatalog[key]);
    changedKeyCount += changedKeys.length;

    for (const key of changedKeys) {
        if (!instructions[key]) {
            failures.push(`${key}: add an ${name} translation instruction.`);
            continue;
        }

        if (key in baseCatalog && instructions[key] === baseInstructions[key]) {
            failures.push(`${key}: update its ${name} translation instruction for the modified English text.`);
        }
    }
}

if (failures.length > 0) {
    console.error('SDK English translation changes require matching instruction changes:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log(`Validated SDK instructions for ${changedKeyCount} new or modified English translation entries.`);
