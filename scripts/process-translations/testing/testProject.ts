import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));

export interface ScriptResult {
    status: number | null;
    stdout: string;
    stderr: string;
}

/**
 * Runs a process-translations script the way the package scripts and the translation pipeline invoke it.
 * The optional environment replaces the inherited one; the spawn timeout keeps a script that never
 * exits from hanging the suite.
 */
export const runProcessTranslationsScript = (scriptFileName: string, args: string[] = [], env?: NodeJS.ProcessEnv): ScriptResult => {
    const result = spawnSync(process.execPath, [join(scriptDirectory, '..', scriptFileName), ...args], {
        encoding: 'utf8',
        env,
        timeout: 30000,
    });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
};

/**
 * Creates a minimal translations project: two domains with catalogs (one of them without a second
 * locale), one domain directory without any catalogs, and matching SDK catalogs.
 */
export const createTranslationsProject = (root: string): void => {
    const writeCatalog = (relativePath: string, translations: Record<string, string>) => {
        const filePath = join(root, relativePath);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, `${JSON.stringify(translations, null, 4)}\n`);
    };

    const i18nConfig = {
        translationSourcePaths: ['packages/sdk/translations/bento/en-US.json', 'packages/sdk/translations/en-US.json'],
        locales: ['da-DK'],
        placeholderFormat: 'YAML',
    };

    writeFileSync(join(root, '.i18nrc'), `${JSON.stringify(i18nConfig, null, 4)}\n`);

    writeCatalog('packages/domains/alpha/vue/translations/en-US.json', { 'alpha.farewell': 'Goodbye', 'alpha.greeting': 'Hello' });
    writeCatalog('packages/domains/alpha/vue/translations/da-DK.json', { 'alpha.farewell': 'Farvel', 'alpha.greeting': 'Hej' });
    writeCatalog('packages/domains/beta/vue/translations/en-US.json', { 'beta.greeting': 'Hi' });
    mkdirSync(join(root, 'packages/domains/gamma/vue'), { recursive: true });

    writeCatalog('packages/sdk/translations/en-US.json', { 'alpha.farewell': 'Goodbye', 'alpha.greeting': 'Hello', 'beta.greeting': 'Hi' });
    writeCatalog('packages/sdk/translations/da-DK.json', { 'alpha.farewell': 'Farvel', 'alpha.greeting': 'Hej' });
};

/**
 * Polls until the condition is satisfied, treating thrown errors (for example a catalog observed
 * mid-write) as "not yet satisfied".
 */
export const waitFor = async (isSatisfied: () => boolean, timeoutMs = 15000): Promise<void> => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            if (isSatisfied()) return;
        } catch {
            // The observed state can be mid-write; retry on the next poll.
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Timed out waiting for the expected condition.');
};
