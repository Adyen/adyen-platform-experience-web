import Localization, { TranslationKey, TranslationOptions } from '../../../core/Localization';
import { EMPTY_OBJECT } from '../../../utils';

export interface KeyFactoryConfig {
    prefix?: string;
    suffix?: string;
}

export interface KeyFactoryFunction {
    (value?: string): string | undefined;
}

export interface TranslationFactoryFunction {
    (i18n: Localization['i18n'], value?: string, options?: TranslationOptions): string | undefined;
}

export interface TranslationFallbackFunction {
    (translationKey: string | undefined, value: string | undefined, options: TranslationOptions | undefined): string | undefined;
}

export const createKeyFactoryFromConfig = (config?: KeyFactoryConfig): KeyFactoryFunction => {
    const { prefix = '', suffix = '' } = config ?? (EMPTY_OBJECT as NonNullable<typeof config>);
    return (value?: string) => (value == undefined ? undefined : `${prefix}${value}${suffix}`);
};

export const createDynamicTranslationFactory =
    (keyFactory: KeyFactoryFunction, translationFallback?: TranslationFallbackFunction): TranslationFactoryFunction =>
    (i18n, value, options) => {
        let translation: string | undefined = undefined;
        const translationKey = keyFactory(value);

        if (translationKey != undefined) {
            translation = i18n.get(translationKey as TranslationKey, options);
            translation = translation === translationKey ? undefined : translation;
        }

        return translation ?? translationFallback?.(translationKey, value, options);
    };
