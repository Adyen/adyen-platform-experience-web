import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Builds the CDN translations tree from the source catalogs. Every catalog directory (the SDK
// catalogs and the `bento/` mirror below them) is staged as:
//
//   locales/{locale}.json the locale's catalog, key -> copy, minified
//   index.json            key -> en-US copy, translator instruction, and placeholders
//
// The runtime reads the locale catalogs. Each one is self-describing on purpose: a client that
// pairs a cached catalog with a newer deployment, or a pinned SDK version with a newer tree, then
// renders stale copy instead of copy taken from the wrong key.
//
// index.json is the reference artifact for custom translators. It replaces the raw
// `en-US.instructions.json`, which no longer ships, and carries each instruction next to the copy
// it describes.
//
// The run fails on a malformed catalog, an instruction for a key that no longer exists, or a
// catalog directory without en-US to build the index from.

const usage = 'Usage: node build-translations-tree.mjs <source-dir> <target-dir>';
const argumentsList = process.argv.slice(2);

if (argumentsList.length !== 2) {
    console.error(usage);
    process.exit(1);
}

const [sourceDirectory, targetDirectory] = argumentsList.map(argument => path.resolve(argument));

const sourceStatistics = await stat(sourceDirectory).catch(() => null);
if (!sourceStatistics?.isDirectory()) {
    console.error(`Source directory not found: ${sourceDirectory}`);
    process.exit(1);
}

const FALLBACK_LOCALE = 'en-US';
const FALLBACK_CATALOG_FILE = `${FALLBACK_LOCALE}.json`;
const INSTRUCTIONS_FILE = `${FALLBACK_LOCALE}.instructions.json`;
const LOCALE_CATALOG_REGEX = /^([a-z]{2}-[A-Z]{2})\.json$/;
const PLACEHOLDER_REGEX = /%{(\w+)}/g;
const REPORTED_FAILURE_SAMPLE_SIZE = 5;

const failures = [];
// Tracked per kind, because the staged tree is not a like-for-like copy of the sources: the locale
// catalogs are minified, while the translator index is generated.
const sourceBytes = { locale: 0, instructions: 0 };
const stagedBytes = { locale: 0, index: 0 };
let fileCount = 0;

const sample = keys => {
    const head = keys.slice(0, REPORTED_FAILURE_SAMPLE_SIZE).join(', ');
    return keys.length > REPORTED_FAILURE_SAMPLE_SIZE ? `${head}, …` : head;
};

const readCatalog = async (filePath, label, kind = 'locale') => {
    const contents = await readFile(filePath, 'utf8');
    sourceBytes[kind] += Buffer.byteLength(contents);

    let parsed;

    try {
        parsed = JSON.parse(contents);
    } catch {
        // A malformed catalog would otherwise be published as-is and fail in the browser.
        failures.push(`malformed translation catalog: ${label}`);
        return null;
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        failures.push(`${label}: expected a flat object of translation keys`);
        return null;
    }

    return parsed;
};

const writeJson = async (filePath, value, kind) => {
    // The source catalogs are 4-space indented for reviewability; the published copy does not need
    // the whitespace, and the runtime parses it either way.
    const compact = `${JSON.stringify(value)}\n`;
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, compact);
    stagedBytes[kind] += Buffer.byteLength(compact);
    fileCount += 1;
};

const placeholdersOf = template => [...new Set(Array.from(template.matchAll(PLACEHOLDER_REGEX), match => match[1]))];

const stageCatalogs = async (source, target, label) => {
    const entries = await readdir(source, { withFileTypes: true });
    const localeCatalogs = new Map();
    const subdirectories = [];
    const passthroughFiles = [];
    let hasInstructions = false;

    for (const entry of entries) {
        if (entry.isDirectory()) {
            subdirectories.push(entry.name);
            continue;
        }

        if (!entry.isFile()) continue;

        if (entry.name === INSTRUCTIONS_FILE) {
            hasInstructions = true;
            continue;
        }

        const localeMatch = LOCALE_CATALOG_REGEX.exec(entry.name);

        if (localeMatch) {
            localeCatalogs.set(localeMatch[1], entry.name);
        } else {
            passthroughFiles.push(entry.name);
        }
    }

    for (const fileName of passthroughFiles) {
        await mkdir(target, { recursive: true });
        await copyFile(path.join(source, fileName), path.join(target, fileName));
        fileCount += 1;
    }

    if (localeCatalogs.size > 0) {
        await stageCatalogDirectory({ source, target, label, localeCatalogs, hasInstructions });
    } else if (hasInstructions) {
        failures.push(`${label}: ${INSTRUCTIONS_FILE} found without any locale catalog`);
    }

    for (const subdirectory of subdirectories) {
        await stageCatalogs(path.join(source, subdirectory), path.join(target, subdirectory), `${label}/${subdirectory}`);
    }
};

const stageCatalogDirectory = async ({ source, target, label, localeCatalogs, hasInstructions }) => {
    if (!localeCatalogs.has(FALLBACK_LOCALE)) {
        failures.push(`${label}: ${FALLBACK_CATALOG_FILE} not found, so the translator index cannot be built`);
        return;
    }

    const defaultCatalog = await readCatalog(path.join(source, FALLBACK_CATALOG_FILE), `${label}/${FALLBACK_CATALOG_FILE}`);
    if (defaultCatalog === null) return;

    const keys = Object.keys(defaultCatalog);
    const keySet = new Set(keys);
    const untranslatableKeys = keys.filter(key => typeof defaultCatalog[key] !== 'string');

    if (untranslatableKeys.length > 0) {
        failures.push(`${label}/${FALLBACK_CATALOG_FILE}: ${untranslatableKeys.length} key(s) without a string value: ${sample(untranslatableKeys)}`);
        return;
    }

    for (const locale of [...localeCatalogs.keys()].sort()) {
        const fileName = localeCatalogs.get(locale);
        const catalog = locale === FALLBACK_LOCALE ? defaultCatalog : await readCatalog(path.join(source, fileName), `${label}/${fileName}`);
        if (catalog === null) continue;

        await writeJson(path.join(target, 'locales', `${locale}.json`), catalog, 'locale');
    }

    let instructions = {};

    if (hasInstructions) {
        const loadedInstructions = await readCatalog(path.join(source, INSTRUCTIONS_FILE), `${label}/${INSTRUCTIONS_FILE}`, 'instructions');
        if (loadedInstructions === null) return;

        const staleKeys = Object.keys(loadedInstructions).filter(key => !keySet.has(key));

        if (staleKeys.length > 0) {
            failures.push(`${label}/${INSTRUCTIONS_FILE}: ${staleKeys.length} instruction(s) for key(s) that no longer exist: ${sample(staleKeys)}`);
            return;
        }

        instructions = loadedInstructions;
    }

    const index = {};

    // Plural variants (`{key}__plural`, `{key}__{count}`) are entries of their own: a translator
    // edits each form on its own terms, and the key already says which form it is.
    for (const key of keys) {
        const value = defaultCatalog[key];
        const instruction = instructions[key];

        index[key] = {
            [FALLBACK_LOCALE]: value,
            ...(typeof instruction === 'string' ? { instruction } : {}),
            placeholders: placeholdersOf(value),
        };
    }

    await writeJson(path.join(target, 'index.json'), index, 'index');
};

await mkdir(targetDirectory, { recursive: true });
await stageCatalogs(sourceDirectory, targetDirectory, path.basename(sourceDirectory));

if (failures.length > 0) {
    console.error(`${failures.length} translation packaging failure(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
}

const savedBytes = sourceBytes.locale - stagedBytes.locale;
const savedPercentage = sourceBytes.locale > 0 ? (100 * savedBytes) / sourceBytes.locale : 0;
const kilobytes = bytes => (bytes / 1024).toFixed(1);

console.log(
    `Staged ${fileCount} translation file(s) to ${path.relative(process.cwd(), targetDirectory) || targetDirectory}: ` +
        `${kilobytes(stagedBytes.locale)} KB of locale catalogs (${savedPercentage.toFixed(1)}% smaller than the source catalogs) ` +
        `and ${kilobytes(stagedBytes.index)} KB of translator index.`
);
