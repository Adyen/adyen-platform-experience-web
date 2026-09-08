import Localization from '../../Localization';
import currentTranslations from '../../../../../sdk/translations/en-US.json';
import { SUPPORTED_LOCALES } from '../../Localization/constants/localization';
import { encodeAnalyticsEvent, getEventInsertId, getEventTime } from './utils';
import { getUserAgent } from '../../runtime';

const currentTranslationKeys = new Set(Object.keys(currentTranslations));

export const getCustomTranslationsAnalyticsPayload = (customTranslations: Localization['customTranslations']) => {
    const payloads = [];
    const customizedLocale = Object.keys(customTranslations);

    if (customizedLocale.length > 0) {
        for (const locale of customizedLocale) {
            const baseEventProperties = {
                category: 'PIE',
                subCategory: 'Core',
                locale,
                sdkVersion: process.env.SDK_VERSION,
                userAgent: getUserAgent(),
            };

            if (!SUPPORTED_LOCALES.includes(locale as any)) {
                const newLanguageEvent = encodeAnalyticsEvent({
                    event: 'Added new language',
                    properties: { ...baseEventProperties, time: getEventTime(), $insert_id: getEventInsertId() },
                });
                if (newLanguageEvent) {
                    payloads.push(newLanguageEvent);
                }
            } else {
                const translations = customTranslations?.[locale];
                const keys = translations ? Object.keys(translations) : [];
                if (keys?.length > 0) {
                    const matchingCustomizedKeys = keys.filter(key => currentTranslationKeys.has(key));

                    // This event is permanent to keep track of all the customizations that user made to translations
                    const allTranslationsEvent = encodeAnalyticsEvent({
                        event: 'Customized translation',
                        properties: { ...baseEventProperties, keys: matchingCustomizedKeys, time: getEventTime(), $insert_id: getEventInsertId() },
                    });
                    if (allTranslationsEvent) {
                        payloads.push(allTranslationsEvent);
                    }
                }
            }
        }
    }
    return payloads;
};
