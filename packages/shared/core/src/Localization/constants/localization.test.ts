import path from 'node:path';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from './localization';

interface CustomFileNamespaces {
    [sourcePath: string]: string;
}

type I18nConfig = {
    translationSourcePaths: string[];
    locales: string[];
    allowUsEnglishAsLocale?: boolean;
    placeholderFormat: string;
    customFileNamespaces?: CustomFileNamespaces;
};

describe('localization config', async () => {
    const englishLocale = 'en-US';
    const i18nConfigPath = path.resolve(__dirname, '../../../../../../.i18nrc');
    const i18n: I18nConfig = JSON.parse(await fs.readFile(i18nConfigPath, 'utf8'));
    const configDirectory = path.dirname(i18nConfigPath);

    it('should have the correct translation source paths', () => {
        const translationSourceFiles = ['packages/shared/assets/src/translations/en-US.json', 'packages/sdk/translations/en-US.json'].map(
            sourcePath => {
                const sourceFile = path.resolve(configDirectory, sourcePath);
                const relativeTranslationsDir = path.relative(path.dirname(i18nConfigPath), path.dirname(sourceFile));
                return `${relativeTranslationsDir}/${englishLocale}.json`;
            }
        );

        expect([...i18n.translationSourcePaths].sort()).toStrictEqual(translationSourceFiles.sort());
    });

    it('should keep every domain locale catalog synchronized with its SDK domain subset', async () => {
        const sdkSourcePath = i18n.translationSourcePaths.find(sourcePath => sourcePath.endsWith(`/sdk/translations/${englishLocale}.json`));
        if (!sdkSourcePath) throw new Error('The SDK English catalog must be registered in .i18nrc.');

        const sdkTranslationsDir = path.dirname(path.resolve(configDirectory, sdkSourcePath));
        const domainsDir = path.resolve(configDirectory, 'packages/domains');
        const domainEntries = await fs.readdir(domainsDir, { withFileTypes: true });

        for (const locale of [englishLocale, ...i18n.locales]) {
            const sdkTranslationsPath = path.join(sdkTranslationsDir, `${locale}.json`);
            const sdkTranslations = JSON.parse(await fs.readFile(sdkTranslationsPath, 'utf8')) as Record<string, string>;

            for (const domainEntry of domainEntries.filter(entry => entry.isDirectory())) {
                const domainTranslationsPath = path.join(domainsDir, domainEntry.name, 'vue/translations', `${locale}.json`);

                try {
                    await fs.access(domainTranslationsPath);
                } catch {
                    continue;
                }

                const domainTranslations = JSON.parse(await fs.readFile(domainTranslationsPath, 'utf8')) as Record<string, string>;

                const expectedTranslations = Object.fromEntries(
                    Object.entries(sdkTranslations).filter(([key]) => key.startsWith(`${domainEntry.name}.`))
                );

                expect(domainTranslations, `${locale}: ${domainEntry.name} catalog must match its SDK domain subset`).toEqual(expectedTranslations);
            }
        }
    });

    it('should expose only domain-qualified V2 SDK keys', async () => {
        const sdkSourcePath = i18n.translationSourcePaths.find(sourcePath => sourcePath.endsWith(`/sdk/translations/${englishLocale}.json`));
        if (!sdkSourcePath) throw new Error('The SDK English catalog must be registered in .i18nrc.');

        const sdkTranslationsDir = path.dirname(path.resolve(configDirectory, sdkSourcePath));
        const domainsDir = path.resolve(configDirectory, 'packages/domains');
        const domainEntries = await fs.readdir(domainsDir, { withFileTypes: true });
        const domains = domainEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);

        for (const locale of [englishLocale, ...i18n.locales]) {
            const sdkTranslationsPath = path.join(sdkTranslationsDir, `${locale}.json`);
            const sdkTranslations = JSON.parse(await fs.readFile(sdkTranslationsPath, 'utf8')) as Record<string, string>;
            const invalidKeys = Object.keys(sdkTranslations).filter(key => !domains.some(domain => key.startsWith(`${domain}.`)));

            expect(invalidKeys, `${locale}: V2 SDK catalog keys must be domain-qualified`).toEqual([]);
        }
    });

    it('should keep every SDK locale catalog synchronized with the English key set', async () => {
        const sdkSourcePath = i18n.translationSourcePaths.find(sourcePath => sourcePath.endsWith(`/sdk/translations/${englishLocale}.json`));
        if (!sdkSourcePath) throw new Error('The SDK English catalog must be registered in .i18nrc.');

        const sdkTranslationsDir = path.dirname(path.resolve(configDirectory, sdkSourcePath));
        const englishTranslationsPath = path.join(sdkTranslationsDir, `${englishLocale}.json`);
        const englishTranslations = JSON.parse(await fs.readFile(englishTranslationsPath, 'utf8')) as Record<string, string>;
        const englishKeys = Object.keys(englishTranslations).sort();

        for (const locale of i18n.locales) {
            const localeTranslationsPath = path.join(sdkTranslationsDir, `${locale}.json`);
            const localeTranslations = JSON.parse(await fs.readFile(localeTranslationsPath, 'utf8')) as Record<string, string>;
            const unknownKeys = Object.keys(localeTranslations).filter(key => !englishKeys.includes(key));
            expect(unknownKeys, `${locale}: SDK catalog must not contain keys missing from the English catalog`).toEqual([]);
        }
    });

    describe.each(i18n.translationSourcePaths)('translation source %s', async sourcePath => {
        const sourceFile = path.resolve(configDirectory, sourcePath);
        const translationsDir = path.dirname(sourceFile);
        const translationFiles = await fs.readdir(translationsDir);

        // prettier-ignore
        const locales = translationFiles
            .filter(file => /^[a-z]{2}-[A-Z]{2}\.json$/.test(file))
            .map(file => file.split('.')[0]);

        it('should contain all supported locales in alphabetical order', () => {
            expect(SUPPORTED_LOCALES).toStrictEqual(locales);
        });

        it('should list all supported locales in alphabetical order (except en-US)', () => {
            const localesWithoutEnglish = locales.filter(locale => locale !== englishLocale);
            expect(i18n.locales).toStrictEqual(localesWithoutEnglish);
        });
    });
});
