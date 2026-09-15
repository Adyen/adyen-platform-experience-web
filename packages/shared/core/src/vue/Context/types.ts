import type { Ref } from 'vue';
import type Localization from '../../Localization';
import type { DevEnvironment } from '../../types';
import type { TranslationKey, TranslationOptions } from '../../translations';

export type TranslationDomain = 'capital' | 'disputes' | 'payByLink' | 'payouts' | 'reports' | 'transactions';
export type DomainTranslationKey = Extract<TranslationKey, `${TranslationDomain}.${string}`>;
export const getDomainTranslationKey = (domain: TranslationDomain, key: string): DomainTranslationKey => `${domain}.${key}` as DomainTranslationKey;

export type I18n = Omit<Localization['i18n'], 'get' | 'has'> & {
    get(key: TranslationKey, options?: TranslationOptions): string;
    has(key: string, options?: TranslationOptions): key is TranslationKey;
};

export interface DomainTranslationBinding {
    i18n: I18n;
    translationDomain: TranslationDomain;
}

export interface CommonPropsTypes {
    isCollatingErrors?: boolean;
}

export interface AssetOptions {
    name: string;
    extension?: string;
    subFolder?: string;
}

export type OnErrorHandler = (error: Error) => void;

export interface CoreProviderProps {
    commonProps?: CommonPropsTypes;
    i18n?: I18n;
    translationDomain?: TranslationDomain;
    loadingContext?: string;
    refreshComponent?: () => void;
    externalErrorHandler?: OnErrorHandler | null;
    componentRef?: Ref<HTMLDivElement | null>;
    getImageAsset?: (props: AssetOptions) => string;
    getDatasetAsset?: (props: AssetOptions) => string;
    getCdnConfig?: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    getCdnDataset?: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    environment?: DevEnvironment;
}

export interface CoreContextValue extends CoreProviderProps {
    i18n: I18n;
    translationDomain: TranslationDomain;
}
