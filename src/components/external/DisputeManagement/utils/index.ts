import Localization from '../../../../core/Localization';
import defenseDocumentConfig from '../../../../config/disputes/defenseDocumentConfig.json';
import defenseReasonConfig from '../../../../config/disputes/defenseReasonConfig.json';

type TranslationConfigItem = {
    title: string;
    help?: string | string[];
    helpitems?: string[];
};

export type Content = {
    title: string;
    primaryDescriptionItems?: string[];
    secondaryDescriptionItems?: string[];
};

const getTranslationIfExists = (i18n: Localization['i18n'], prefix: string, key: string): string | undefined => {
    const prefixedKey = `${prefix}.${key}`;
    return i18n.has(prefixedKey) ? i18n.get(prefixedKey) : undefined;
};

const getContent = (
    i18n: Localization['i18n'],
    config: Record<string, TranslationConfigItem>,
    configItemKey: string,
    translationPrefix: string
): Content => {
    const configItem = config[configItemKey];

    const title = (configItem && getTranslationIfExists(i18n, translationPrefix, configItem.title)) || configItemKey;
    const descriptionKeys = configItem?.help ? (Array.isArray(configItem.help) ? configItem.help : [configItem.help]) : undefined;
    const primaryDescriptionItems: string[] | undefined = descriptionKeys
        ?.map(key => getTranslationIfExists(i18n, translationPrefix, key))
        .filter((k): k is string => k !== undefined);
    const secondaryDescriptionItems: string[] = [];

    if (configItem?.helpitems) {
        configItem.helpitems.forEach(item => {
            const translation = getTranslationIfExists(i18n, translationPrefix, item);
            if (translation) secondaryDescriptionItems.push(translation);
        });
    }

    return {
        title: title,
        ...(primaryDescriptionItems?.length ? { primaryDescriptionItems } : {}),
        ...(secondaryDescriptionItems?.length ? { secondaryDescriptionItems } : {}),
    };
};

export const getDefenseDocumentContent = (i18n: Localization['i18n'], defenseDocumentKey: string) => {
    return getContent(i18n, defenseDocumentConfig, defenseDocumentKey, 'disputes.defenseDocument');
};

export const getDefenseReasonContent = (i18n: Localization['i18n'], defenseReasonKey: string) => {
    return getContent(i18n, defenseReasonConfig, defenseReasonKey, 'disputes.defenseReason');
};
