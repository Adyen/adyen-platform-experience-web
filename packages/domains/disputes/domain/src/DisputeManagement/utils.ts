import { isDisputesTranslationKey, type DisputesTranslationKey } from '../translations/index';

export type TranslationConfigItem = {
    title: string;
    help?: string | string[];
    helpitems?: string[];
};

export type TranslationConfigContent = {
    title: string;
    primaryDescriptionItems?: string[];
    secondaryDescriptionItems?: string[];
};

/**
 * The defense-content keys these helpers can produce. Shared with the Preact elements, whose
 * `Localization` i18n accepts the public V1 catalog: this subset keeps both the Preact and the
 * Vue i18n assignable without exposing the full domain catalog union.
 */
type DisputesConfigTranslationKey = Extract<
    DisputesTranslationKey,
    `disputes.management.common.defenseDocuments.${string}` | `disputes.management.common.defenseReasons.${string}`
>;

type DisputesConfigI18n = Readonly<{
    get(key: DisputesConfigTranslationKey): string;
    has(key: string): boolean;
}>;

const getTranslationIfExists = (i18n: DisputesConfigI18n, prefix: string, key: string): string | undefined => {
    const prefixedKey = `${prefix}.${key}`;
    return isDisputesTranslationKey(prefixedKey) && i18n.has(prefixedKey) ? i18n.get(prefixedKey as DisputesConfigTranslationKey) : undefined;
};

const getContent = (
    i18n: DisputesConfigI18n,
    config: Record<string, TranslationConfigItem>,
    configItemKey: string,
    translationPrefix: string
): TranslationConfigContent | undefined => {
    const configItem = config[configItemKey];
    if (!configItem) return undefined;

    const title = getTranslationIfExists(i18n, translationPrefix, configItem.title);
    const descriptionKeys = configItem.help ? (Array.isArray(configItem.help) ? configItem.help : [configItem.help]) : undefined;
    const primaryDescriptionItems = descriptionKeys
        ?.map(key => getTranslationIfExists(i18n, translationPrefix, key))
        .filter((translation): translation is string => translation !== undefined);
    const secondaryDescriptionItems: string[] = [];

    configItem.helpitems?.forEach(item => {
        const translation = getTranslationIfExists(i18n, translationPrefix, item);
        if (translation) secondaryDescriptionItems.push(translation);
    });

    return {
        title: title || '',
        ...(primaryDescriptionItems?.length ? { primaryDescriptionItems } : {}),
        ...(secondaryDescriptionItems.length ? { secondaryDescriptionItems } : {}),
    };
};

export const getDefenseDocumentContent = (
    defenseDocumentConfig: Record<string, TranslationConfigItem>,
    i18n: DisputesConfigI18n,
    defenseDocumentKey: string
) => getContent(i18n, defenseDocumentConfig, defenseDocumentKey, 'disputes.management.common.defenseDocuments');

export const getDefenseReasonContent = (
    defenseReasonConfig: Record<string, TranslationConfigItem>,
    i18n: DisputesConfigI18n,
    defenseReasonKey: string
) => getContent(i18n, defenseReasonConfig, defenseReasonKey, 'disputes.management.common.defenseReasons');
