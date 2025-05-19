import Localization from '../../../../core/Localization';
import defenseDocumentConfig from '../../../../config/disputes/defenseDocumentConfig.json';
import defenseReasonConfig from '../../../../config/disputes/defenseReasonConfig.json';

type TranslationConfigItem = {
    title: string;
    help?: string | string[];
    helpitems?: string[];
};

const getTranslationIfExists = (i18n: Localization['i18n'], prefix: string, key: string) => {
    const prefixedKey = `${prefix}.${key}`;
    return i18n.has(prefixedKey) ? i18n.get(prefixedKey) : undefined;
};

const getContent = (i18n: Localization['i18n'], config: Record<string, TranslationConfigItem>, configItemKey: string, translationPrefix: string) => {
    const configItem = config[configItemKey];
    if (!configItem) return undefined;

    const title = getTranslationIfExists(i18n, translationPrefix, configItem.title);

    const descriptionKeys = configItem.help ? (Array.isArray(configItem.help) ? configItem.help : [configItem.help]) : undefined;
    const primaryDescriptionItems = descriptionKeys?.map(key => getTranslationIfExists(i18n, translationPrefix, key)).filter(Boolean);

    if (primaryDescriptionItems?.length && configItem.helpitems) {
        const secondaryDescriptionItems = configItem.helpitems
            .map(item => {
                const translation = getTranslationIfExists(i18n, translationPrefix, item);
                return translation ? `<li>${translation}</li>` : undefined;
            })
            .filter(Boolean);

        primaryDescriptionItems.push(`<ul>${secondaryDescriptionItems}</ul>`);
    }

    const description = primaryDescriptionItems?.map(item => `<p>${item}</p>`).join();

    return { title, ...(description ? { description } : {}) };
};

export const getDefenseDocumentContent = (i18n: Localization['i18n'], defenseDocumentKey: string) => {
    return getContent(i18n, defenseDocumentConfig, defenseDocumentKey, 'disputes.defenseDocument');
};

export const getDefenseReasonContent = (i18n: Localization['i18n'], defenseReasonKey: string) => {
    return getContent(i18n, defenseReasonConfig, defenseReasonKey, 'disputes.defenseReason');
};
