import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SAFE_ENV } from './safe-env.mjs';

const scriptDirectory = import.meta.dirname;
const defaultProjectRoot = path.resolve(scriptDirectory, '../..');
const sdkTranslationsDirectoryName = 'packages/sdk/translations';
const domainsDirectoryName = 'packages/domains';
const domainTranslationsDirectoryName = 'vue/translations';
const sortJsonPath = path.join(scriptDirectory, 'sort-json');
const englishLocale = 'en-US';
const rootArgumentPrefix = '--root=';

const checkOnly = process.argv.includes('--check');
const rootArgument = process.argv.find(argument => argument.startsWith(rootArgumentPrefix));

// Tests and tooling can point the script at a throwaway project root; the default is this checkout.
const projectRoot = rootArgument ? path.resolve(rootArgument.slice(rootArgumentPrefix.length)) : defaultProjectRoot;
const i18nConfigPath = path.join(projectRoot, '.i18nrc');
const sdkTranslationsDirectory = path.join(projectRoot, sdkTranslationsDirectoryName);
const domainsDirectory = path.join(projectRoot, domainsDirectoryName);

if (rootArgument) {
    const rootStatistics = await stat(projectRoot);
    if (!rootStatistics.isDirectory()) {
        throw new Error(`The ${rootArgumentPrefix} option must point at a directory: ${projectRoot}`);
    }
}

const getRelativePath = filePath => path.relative(projectRoot, filePath);

const readJson = async filePath => {
    try {
        return JSON.parse(await readFile(filePath, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
};

const writeJson = async (filePath, value) => {
    await writeFile(filePath, `${JSON.stringify(value, null, 4)}\n`);
};

const sortJson = value => {
    const serializedValue = JSON.stringify(value);
    // The payload is passed on stdin: passing it as an argument fails with E2BIG on Linux because
    // SDK catalogs exceed the ~128KB single-argument limit (MAX_ARG_STRLEN).
    // The async execFile does not support the `input` option, so the synchronous variant is used.
    // The helper is invoked through the absolute path of the running node binary instead of its
    // shebang, so its interpreter is not resolved through a writable PATH.
    const stdout = execFileSync(process.execPath, [sortJsonPath], {
        input: serializedValue,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        env: SAFE_ENV,
    });
    return stdout ? JSON.parse(stdout) : value;
};

const i18nConfig = await readJson(i18nConfigPath);
if (!i18nConfig) {
    throw new Error(`Unable to read ${getRelativePath(i18nConfigPath)} from the working tree.`);
}

const locales = [englishLocale, ...i18nConfig.locales];
const domainEntries = await readdir(domainsDirectory, { withFileTypes: true });

const hasTranslations = async domain =>
    (await readJson(path.join(domainsDirectory, domain, domainTranslationsDirectoryName, `${englishLocale}.json`))) !== null;

const domains = (
    await Promise.all(
        domainEntries.filter(entry => entry.isDirectory()).map(async entry => ((await hasTranslations(entry.name)) ? entry.name : null))
    )
)
    .filter(Boolean)
    .sort();

let outOfSync = false;

for (const locale of locales) {
    const sdkTranslationsPath = path.join(sdkTranslationsDirectory, `${locale}.json`);
    const sdkTranslations = await readJson(sdkTranslationsPath);
    if (sdkTranslations === null) {
        throw new Error(`Unable to read ${getRelativePath(sdkTranslationsPath)} from the working tree.`);
    }

    const translationsByDomain = new Map(domains.map(domain => [domain, {}]));
    const orphanedKeys = [];

    for (const [key, value] of Object.entries(sdkTranslations)) {
        const owningDomain = domains.find(domain => key.startsWith(`${domain}.`));

        if (!owningDomain) {
            orphanedKeys.push(key);
            continue;
        }

        translationsByDomain.get(owningDomain)[key] = value;
    }

    if (orphanedKeys.length > 0) {
        throw new Error(`${getRelativePath(sdkTranslationsPath)} contains keys outside every domain namespace: ${orphanedKeys.join(', ')}`);
    }

    for (const domain of domains) {
        const domainTranslationsPath = path.join(domainsDirectory, domain, domainTranslationsDirectoryName, `${locale}.json`);
        const expectedTranslations = sortJson(translationsByDomain.get(domain));
        const domainTranslations = await readJson(domainTranslationsPath);

        // A domain without values for the locale and without an existing catalog stays catalog-less.
        if (domainTranslations === null && Object.keys(expectedTranslations).length === 0) continue;
        if (JSON.stringify(domainTranslations) === JSON.stringify(expectedTranslations)) continue;

        outOfSync = true;

        if (checkOnly) {
            console.error(`${getRelativePath(domainTranslationsPath)} is not synchronized with its SDK catalog subset.`);
        } else {
            await writeJson(domainTranslationsPath, expectedTranslations);
            console.log(`Synchronized ${getRelativePath(domainTranslationsPath)}.`);
        }
    }
}

if (outOfSync && checkOnly) {
    console.error('Run `pnpm run translations:split` and commit the domain catalog updates.');
    process.exit(1);
}

if (!outOfSync) {
    console.log('Domain catalogs are synchronized with SDK translations.');
}
