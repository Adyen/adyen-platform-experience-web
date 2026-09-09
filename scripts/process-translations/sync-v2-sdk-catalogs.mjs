import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '../..');
const i18nConfigPath = path.join(projectRoot, '.i18nrc');
const sdkTranslationsDirectory = path.join(projectRoot, 'packages/sdk/translations');
const domainsDirectory = path.join(projectRoot, 'packages/domains');
const sortJsonPath = path.join(projectRoot, 'scripts/process-translations/sort-json');
const englishLocale = 'en-US';

const checkOnly = process.argv.includes('--check');
const execFile = promisify(execFileCallback);

const readJson = async filePath => JSON.parse(await readFile(filePath, 'utf8'));
const writeJson = (filePath, value) => writeFile(filePath, `${JSON.stringify(value, null, 4)}\n`);
const sortJson = async value => {
    const serializedValue = JSON.stringify(value);
    const { stdout } = await execFile(sortJsonPath, [serializedValue]);
    return stdout ? JSON.parse(stdout) : value;
};

const hasTranslations = async domain => {
    try {
        await access(path.join(domainsDirectory, domain, 'vue/translations', `${englishLocale}.json`));
        return true;
    } catch {
        return false;
    }
};

const i18nConfig = await readJson(i18nConfigPath);
const locales = [englishLocale, ...i18nConfig.locales];
const domainEntries = await readdir(domainsDirectory, { withFileTypes: true });

const domains = (
    await Promise.all(
        domainEntries.filter(entry => entry.isDirectory()).map(async entry => ((await hasTranslations(entry.name)) ? entry.name : null))
    )
)
    .filter(Boolean)
    .sort();

let outOfSync = false;

for (const locale of locales) {
    const translations = {};

    for (const domain of domains) {
        const domainTranslationsPath = path.join(domainsDirectory, domain, 'vue/translations', `${locale}.json`);
        const domainTranslations = await readJson(domainTranslationsPath);

        for (const [key, value] of Object.entries(domainTranslations)) {
            if (!key.startsWith(`${domain}.`)) {
                throw new Error(`${path.relative(projectRoot, domainTranslationsPath)} contains a key outside the ${domain} namespace: ${key}`);
            }

            translations[key] = value;
        }
    }

    const expectedTranslations = await sortJson(translations);

    const sdkTranslationsPath = path.join(sdkTranslationsDirectory, `${locale}.json`);
    const sdkTranslations = await readJson(sdkTranslationsPath);

    if (JSON.stringify(sdkTranslations) === JSON.stringify(expectedTranslations)) continue;

    outOfSync = true;

    if (checkOnly) {
        console.error(`${path.relative(projectRoot, sdkTranslationsPath)} is not synchronized with domain translations.`);
    } else {
        await writeJson(sdkTranslationsPath, expectedTranslations);
        console.log(`Synchronized ${path.relative(projectRoot, sdkTranslationsPath)}.`);
    }
}

if (outOfSync && checkOnly) {
    console.error('Run `pnpm run translations:sync-v2` and commit the generated SDK catalog updates.');
    process.exit(1);
}

if (!outOfSync) {
    console.log('V2 SDK catalogs are synchronized with domain translations.');
}
