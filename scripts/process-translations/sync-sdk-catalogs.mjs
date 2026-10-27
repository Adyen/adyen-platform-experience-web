import { execFile as execFileCallback, execFileSync } from 'node:child_process';
import { watch } from 'node:fs';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { GIT_BIN, SAFE_ENV } from './safe-env.mjs';

const scriptDirectory = import.meta.dirname;
const defaultProjectRoot = path.resolve(scriptDirectory, '../..');
const sdkTranslationsDirectoryName = 'packages/sdk/translations';
const domainsDirectoryName = 'packages/domains';
const domainTranslationsDirectoryName = 'vue/translations';
const sortJsonPath = path.join(scriptDirectory, 'sort-json');
const englishLocale = 'en-US';
const rootArgumentPrefix = '--root=';
const rerunDelayMs = 100;

const checkOnly = process.argv.includes('--check');
const stagedOnly = process.argv.includes('--staged');
const watchMode = process.argv.includes('--watch');
const rootArgument = process.argv.find(argument => argument.startsWith(rootArgumentPrefix));

// Tests and tooling can point the script at a throwaway project root; the default is this checkout.
const projectRoot = rootArgument ? path.resolve(rootArgument.slice(rootArgumentPrefix.length)) : defaultProjectRoot;
const i18nConfigPath = path.join(projectRoot, '.i18nrc');
const sdkTranslationsDirectory = path.join(projectRoot, sdkTranslationsDirectoryName);
const domainsDirectory = path.join(projectRoot, domainsDirectoryName);

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
            const { stdout } = await execFile(GIT_BIN, ['show', `:${getRelativePath(filePath)}`], { cwd: projectRoot, env: SAFE_ENV });
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

    const blobHash = execFileSync(GIT_BIN, ['hash-object', '-w', '--stdin'], {
        cwd: projectRoot,
        input: content,
        encoding: 'utf8',
        env: SAFE_ENV,
    });
    await execFile(GIT_BIN, ['update-index', '--add', '--cacheinfo', '100644', blobHash.trim(), getRelativePath(filePath)], {
        cwd: projectRoot,
        env: SAFE_ENV,
    });
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

const hasTranslations = async domain =>
    (await readJson(path.join(domainsDirectory, domain, domainTranslationsDirectoryName, `${englishLocale}.json`))) !== null;

const synchronize = async () => {
    const i18nConfig = await readJson(i18nConfigPath);
    if (!i18nConfig) {
        throw new Error(`Unable to read ${getRelativePath(i18nConfigPath)} from the ${stagedOnly ? 'staged snapshot' : 'working tree'}.`);
    }

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
            const domainTranslationsPath = path.join(domainsDirectory, domain, domainTranslationsDirectoryName, `${locale}.json`);
            const domainTranslations = await readJson(domainTranslationsPath);
            if (domainTranslations === null) continue;

            for (const [key, value] of Object.entries(domainTranslations)) {
                if (!key.startsWith(`${domain}.`)) {
                    throw new Error(`${getRelativePath(domainTranslationsPath)} contains a key outside the ${domain} namespace: ${key}`);
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
            console.error(`${getRelativePath(sdkTranslationsPath)} is not synchronized with domain translations.`);
        } else {
            await writeJson(sdkTranslationsPath, expectedTranslations);
            console.log(`Synchronized ${getRelativePath(sdkTranslationsPath)}.`);
        }
    }

    return outOfSync;
};

// Debounces change events into batched synchronization passes, and never runs two passes
// concurrently: overlapping passes would interleave their catalog reads and writes. A pass that
// comes due while another one is still running is postponed until the running pass finishes.
// Exported so tests can exercise the scheduling contract directly.
export const createSynchronizationScheduler = (runPass, delayMs) => {
    let isSyncing = false;
    let rerunTimeout = null;
    const pendingChanges = new Set();

    const runScheduledPass = async () => {
        if (isSyncing) {
            if (rerunTimeout) clearTimeout(rerunTimeout);
            rerunTimeout = setTimeout(runScheduledPass, delayMs);
            return;
        }

        isSyncing = true;
        const changedPaths = [...pendingChanges];
        pendingChanges.clear();

        try {
            await runPass(changedPaths);
        } finally {
            isSyncing = false;
        }
    };

    return {
        schedule: changedPath => {
            pendingChanges.add(changedPath);
            if (rerunTimeout) clearTimeout(rerunTimeout);
            rerunTimeout = setTimeout(runScheduledPass, delayMs);
        },
    };
};

// Matches the catalog file names that the domain catalog watchers report relative to the domains directory.
const domainCatalogFilePattern = new RegExp(`(^|/)${domainTranslationsDirectoryName.replaceAll('/', '\\/')}/[^/]+\\.json$`);

// Windows reports watcher file names with backslash separators, so they are normalized before
// matching. Exported so tests can exercise the file-name matching directly.
export const isDomainCatalogFile = filename => typeof filename === 'string' && domainCatalogFilePattern.test(filename.replaceAll('\\', '/'));

const runOnce = async () => {
    const outOfSync = await synchronize();

    if (outOfSync && checkOnly) {
        console.error('Run `pnpm run translations:sync` and commit the generated SDK catalog updates.');
        process.exit(1);
    }

    if (!outOfSync) {
        console.log('SDK catalogs are synchronized with domain translations.');
    }
};

const runWatchMode = async () => {
    // A failed synchronization does not stop the watcher: the process can be embedded in a
    // longer-lived one (for example a dev-server script), so it keeps watching and retries on
    // the next change.
    try {
        await synchronize();
    } catch (error) {
        console.error(`The initial synchronization failed and will retry on the next change: ${error.message}`);
    }

    console.log(`Watching for domain catalog changes under ${getRelativePath(domainsDirectory)} and ${getRelativePath(i18nConfigPath)}...`);

    const watchers = [];

    const stopWatching = exitCode => {
        watchers.forEach(watcher => watcher.close());
        process.exit(exitCode);
    };

    const scheduler = createSynchronizationScheduler(async changedPaths => {
        console.log(`Re-synchronizing after changes in ${changedPaths.join(', ')}.`);

        try {
            await synchronize();
        } catch (error) {
            // A catalog can be observed mid-write; the next change event retries the synchronization.
            console.error(`Synchronization failed and will retry on the next change: ${error.message}`);
        }
    }, rerunDelayMs);

    const scheduleRerun = changedPath => scheduler.schedule(getRelativePath(changedPath));

    // Some platforms report directory events without a filename; those are treated as potential
    // catalog changes because a synchronization pass over unchanged catalogs is a cheap no-op.
    const handleDomainCatalogEvent = filename => {
        if (filename === null || filename === undefined) {
            scheduleRerun(domainsDirectory);
            return;
        }
        if (isDomainCatalogFile(filename)) scheduleRerun(path.join(domainsDirectory, filename));
    };

    const handleI18nConfigEvent = filename => {
        if (filename === null || filename === undefined || filename === path.basename(i18nConfigPath)) scheduleRerun(i18nConfigPath);
    };

    // Only the domain catalogs and the i18n configuration are watched: the SDK catalogs are generated
    // output, so watching them would only observe this script's own writes. Each domain's catalog
    // directory is watched individually instead of the domains directory recursively: recursive
    // watching needs newer runtimes on Linux and a watch per catalog directory is cheaper, at the
    // price of missing domains that appear after the watcher starts.
    const domainEntries = await readdir(domainsDirectory, { withFileTypes: true });

    for (const entry of domainEntries) {
        if (!entry.isDirectory()) continue;

        const domainTranslationsDirectory = path.join(domainsDirectory, entry.name, domainTranslationsDirectoryName);

        let directoryStatistics;
        try {
            directoryStatistics = await stat(domainTranslationsDirectory);
        } catch {
            // Not every domain owns a translations catalog.
            continue;
        }
        if (!directoryStatistics.isDirectory()) continue;

        watchers.push(
            watch(domainTranslationsDirectory, (_eventType, filename) => {
                handleDomainCatalogEvent(
                    filename === null || filename === undefined ? null : path.join(entry.name, domainTranslationsDirectoryName, filename)
                );
            })
        );
    }

    watchers.push(watch(projectRoot, (_eventType, filename) => handleI18nConfigEvent(filename)));

    for (const watcher of watchers) {
        watcher.once('error', error => {
            console.error(`Translation watch failed: ${error.message}`);
            stopWatching(1);
        });
    }

    // SIGINT covers interactive interruption; SIGTERM is what process managers and containers send,
    // so the watcher stops through the same graceful path instead of dying by the signal's default
    // disposition.
    process.once('SIGINT', () => stopWatching(0));
    process.once('SIGTERM', () => stopWatching(0));
};

// The module can be imported (by tests) without side effects; the CLI part below only runs when the
// file is executed directly.
const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
    if (watchMode && (checkOnly || stagedOnly)) {
        console.error('The --watch option cannot be combined with --check or --staged.');
        process.exit(1);
    }

    // The watcher is a local development aid: CI environments never keep it running.
    if (watchMode && process.env.CI) {
        console.log('Translations watch skipped: CI environment detected.');
        process.exit(0);
    }

    if (rootArgument) {
        const rootStatistics = await stat(projectRoot);
        if (!rootStatistics.isDirectory()) {
            throw new Error(`The ${rootArgumentPrefix} option must point at a directory: ${projectRoot}`);
        }
    }

    if (!watchMode) {
        await runOnce();
    } else {
        await runWatchMode();
    }
}
