import Localization from '../../../../core/Localization';
import defenseDocumentConfig from '../../../../config/disputes/defenseDocumentConfig.json';
import defenseReasonConfig from '../../../../config/disputes/defenseReasonConfig.json';

type TranslationConfigItem = {
    title: string;
    help?: string | string[];
    helpitems?: string[];
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
): undefined | { title: string; description: string[] | undefined; secondaryDescriptionItems: string[] | undefined } => {
    const configItem = config[configItemKey];
    if (!configItem) return undefined;

    const t = (k: string) => getTranslationIfExists(i18n, 'disputes.defenseDocument', k);

    const title = t(configItem.title);

    const descriptionKeys = configItem.help ? (Array.isArray(configItem.help) ? configItem.help : [configItem.help]) : undefined;
    const primaryDescriptionItems: string[] | undefined = descriptionKeys
        ?.map(key => getTranslationIfExists(i18n, translationPrefix, key))
        .filter((k): k is string => k !== undefined);

    const secondaryDescriptionItems: string[] = [];

    if (primaryDescriptionItems?.length && configItem.helpitems) {
        configItem.helpitems.forEach(item => {
            const translation = getTranslationIfExists(i18n, translationPrefix, item);
            if (translation) secondaryDescriptionItems.push(translation);
        });
    }

    return {
        title: title || '',
        ...{ description: primaryDescriptionItems || undefined, secondaryDescriptionItems: secondaryDescriptionItems || undefined },
    };
};

export const getDefenseDocumentContent = (i18n: Localization['i18n'], defenseDocumentKey: string) => {
    return getContent(i18n, defenseDocumentConfig, defenseDocumentKey, 'disputes.defenseDocument');
};

export const getDefenseReasonContent = (i18n: Localization['i18n'], defenseReasonKey: string) => {
    return getContent(i18n, defenseReasonConfig, defenseReasonKey, 'disputes.defenseReason');
};
