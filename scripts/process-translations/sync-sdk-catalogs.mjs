import { execFile as execFileCallback, execFileSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '../..');
const i18nConfigPath = path.join(projectRoot, '.i18nrc');
const sdkTranslationsDirectory = path.join(projectRoot, 'packages/sdk/translations');
const domainsDirectory = path.join(projectRoot, 'packages/domains');
const sortJsonPath = path.join(projectRoot, 'scripts/process-translations/sort-json');
const englishLocale = 'en-US';

const checkOnly = process.argv.includes('--check');
const stagedOnly = process.argv.includes('--staged');
const execFile = promisify(execFileCallback);

const getRelativePath = filePath => path.relative(projectRoot, filePath);

const readJson = async filePath => {
    let fileContent;
    if (!stagedOnly) {
        try {
            fileContent = await readFile(filePath, 'utf8');
        } catch (error) {
            if (error.code === 'ENOENT') return null;
            throw error;
        }
    } else {
        try {
            const { stdout } = await execFile('git', ['show', `:${getRelativePath(filePath)}`], { cwd: projectRoot });
            fileContent = stdout;
        } catch {
            return null;
        }
    }
    return JSON.parse(fileContent);
};

const writeJson = async (filePath, value) => {
    const content = `${JSON.stringify(value, null, 4)}\n`;

    if (!stagedOnly) {
        await writeFile(filePath, content);
        return;
    }

    const blobHash = execFileSync('git', ['hash-object', '-w', '--stdin'], { cwd: projectRoot, input: content, encoding: 'utf8' });
    await execFile('git', ['update-index', '--add', '--cacheinfo', '100644', blobHash.trim(), getRelativePath(filePath)], { cwd: projectRoot });
};

const sortJson = value => {
    const serializedValue = JSON.stringify(value);
    // The payload is passed on stdin: passing it as an argument fails with E2BIG on Linux because
    // SDK catalogs exceed the ~128KB single-argument limit (MAX_ARG_STRLEN).
    // The async execFile does not support the `input` option, so the synchronous variant is used.
    const stdout = execFileSync(sortJsonPath, [], { input: serializedValue, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    return stdout ? JSON.parse(stdout) : value;
};

const hasTranslations = async domain => (await readJson(path.join(domainsDirectory, domain, 'vue/translations', `${englishLocale}.json`))) !== null;

const i18nConfig = await readJson(i18nConfigPath);
if (!i18nConfig) throw new Error(`Unable to read ${getRelativePath(i18nConfigPath)} from the ${stagedOnly ? 'staged snapshot' : 'working tree'}.`);

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
        if (domainTranslations === null) continue;

        for (const [key, value] of Object.entries(domainTranslations)) {
            if (!key.startsWith(`${domain}.`)) {
                throw new Error(`${path.relative(projectRoot, domainTranslationsPath)} contains a key outside the ${domain} namespace: ${key}`);
            }

            translations[key] = value;
        }
    }

    const expectedTranslations = sortJson(translations);

    const sdkTranslationsPath = path.join(sdkTranslationsDirectory, `${locale}.json`);
    const sdkTranslations = await readJson(sdkTranslationsPath);

    if (sdkTranslations === null) {
        throw new Error(`Unable to read ${getRelativePath(sdkTranslationsPath)} from the ${stagedOnly ? 'staged snapshot' : 'working tree'}.`);
    }

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
    console.error('Run `pnpm run translations:sync` and commit the generated SDK catalog updates.');
    process.exit(1);
}

if (!outOfSync) {
    console.log('SDK catalogs are synchronized with domain translations.');
}
