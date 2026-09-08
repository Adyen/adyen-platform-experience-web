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
