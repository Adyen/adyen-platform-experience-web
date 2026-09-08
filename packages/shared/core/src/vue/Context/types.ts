import type { Ref } from 'vue';
import type Localization from '../../Localization';
import type { DevEnvironment } from '../../types';
import type { TranslationKey, TranslationOptions } from '../../translations';

export type V2TranslationDomain = 'capital' | 'disputes' | 'payByLink' | 'payouts' | 'reports' | 'transactions';
export type V2TranslationKey = `${V2TranslationDomain}.${string}`;
export const getV2TranslationKey = (domain: V2TranslationDomain, key: string): V2TranslationKey => `${domain}.${key}`;

export type I18n = Omit<Localization['i18n'], 'get' | 'has'> & {
    get(key: TranslationKey | V2TranslationKey, options?: TranslationOptions): string;
    has(key: string, options?: TranslationOptions): key is TranslationKey | V2TranslationKey;
};

export interface DomainTranslationBinding {
    i18n: I18n;
    translationDomain: V2TranslationDomain;
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
    translationDomain?: V2TranslationDomain;
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
    translationDomain: V2TranslationDomain;
}
