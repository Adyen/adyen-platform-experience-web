import { describe, expect, test } from 'vitest';
import termsRequirementsConfig from '../../../../../../../config/payByLink/termsRequirementsConfig.json';
import enUSTranslations from '../../../../../../../assets/translations/en-US.json';

describe('termsRequirementsConfig', () => {
    const translationKeys = Object.keys(enUSTranslations);

    const getAllTranslationKeysFromConfig = () => {
        const keys: string[] = [];

        keys.push(termsRequirementsConfig.titleKey);

        for (const section of termsRequirementsConfig.sections) {
            keys.push(section.titleKey);
            keys.push(section.descriptionKey);

            for (const item of section.items) {
                keys.push(item.key);
            }
        }

        return keys;
    };

    test('all translation keys in config exist in en-US.json', () => {
        const configKeys = getAllTranslationKeysFromConfig();

        for (const key of configKeys) {
            expect(translationKeys, `Translation key "${key}" not found in en-US.json`).toContain(key);
        }
    });

    test.each(getAllTranslationKeysFromConfig())('translation key "%s" exists in en-US.json', key => {
        expect(translationKeys).toContain(key);
    });
});
