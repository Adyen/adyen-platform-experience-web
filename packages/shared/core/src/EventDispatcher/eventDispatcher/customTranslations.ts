import Localization from '../../Localization';
import { SUPPORTED_LOCALES } from '../../Localization/constants/localization';
import { encodeAnalyticsEvent, getEventInsertId, getEventTime } from './utils';
import { getUserAgent } from '../../runtime';

let currentTranslationKeys: Promise<Set<string>> | undefined;

const loadCurrentTranslationKeys = () =>
    (currentTranslationKeys ??= import('../../../../../sdk/translations/en-US.json').then(
        ({ default: currentTranslations }) => new Set(Object.keys(currentTranslations)),
        error => {
            currentTranslationKeys = undefined;
            throw error;
        }
    ));

const isSupportedLocale = (locale: string) => SUPPORTED_LOCALES.includes(locale as any);

const getBaseEventProperties = (locale: string) => ({
    category: 'PIE',
    subCategory: 'Core',
    locale,
    sdkVersion: process.env.SDK_VERSION,
    userAgent: getUserAgent(),
});

const getNewLanguagePayload = (locale: string) =>
    encodeAnalyticsEvent({
        event: 'Added new language',
        properties: { ...getBaseEventProperties(locale), time: getEventTime(), $insert_id: getEventInsertId() },
    });

const getCustomizedTranslationPayload = (locale: string, keys: string[], translationKeys: Set<string>) => {
    const matchingCustomizedKeys = keys.filter(key => translationKeys.has(key));
    const unmatchedCustomizedKeys = keys.filter(key => !translationKeys.has(key));

    // This event is permanent to keep track of all the customizations that user made to translations
    return encodeAnalyticsEvent({
        event: 'Customized translation',
        properties: {
            ...getBaseEventProperties(locale),
            ...(matchingCustomizedKeys.length > 0 && { keys: matchingCustomizedKeys }),
            ...(unmatchedCustomizedKeys.length > 0 && { unmatchedKeys: unmatchedCustomizedKeys }),
            time: getEventTime(),
            $insert_id: getEventInsertId(),
        },
    });
};

export const getCustomTranslationsAnalyticsPayload = async (customTranslations: Localization['customTranslations']) => {
    const customizedLocales = Object.keys(customTranslations);
    const getCustomizedKeys = (locale: string) => Object.keys(customTranslations[locale] ?? {});

    const hasCustomizedSupportedLocale = customizedLocales.some(locale => isSupportedLocale(locale) && getCustomizedKeys(locale).length > 0);
    const translationKeys = hasCustomizedSupportedLocale ? await loadCurrentTranslationKeys() : new Set<string>();

    return customizedLocales.flatMap(locale => {
        if (!isSupportedLocale(locale)) return getNewLanguagePayload(locale) ?? [];

        const keys = getCustomizedKeys(locale);
        if (keys.length === 0) return [];

        return getCustomizedTranslationPayload(locale, keys, translationKeys) ?? [];
    });
};
