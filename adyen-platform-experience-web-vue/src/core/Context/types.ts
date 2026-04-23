import type { Ref } from 'vue';

export interface CommonPropsTypes {
    isCollatingErrors?: boolean;
}

export interface AssetOptions {
    name: string;
    extension?: string;
    subFolder?: string;
}

export interface I18n {
    get: (key: string, options?: Record<string, any>) => string;
    amount: (amount: number, currencyCode: string, options?: { hideCurrency?: boolean }) => string;
    date: (date: number | string | Date, options?: Intl.DateTimeFormatOptions) => string;
    fullDate: (date: number | string | Date) => string;
    has: (key: string) => boolean;
    locale: string;
    ready: Promise<void>;
}

export type OnErrorHandler = (error: Error) => void;

export interface CoreProviderProps {
    commonProps?: CommonPropsTypes;
    i18n?: I18n;
    loadingContext?: string;
    updateCore?: () => void;
    externalErrorHandler?: OnErrorHandler | null;
    componentRef?: Ref<HTMLDivElement | null>;
    getImageAsset?: (props: AssetOptions) => string;
    getDatasetAsset?: (props: AssetOptions) => string;
    getCdnConfig?: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    getCdnDataset?: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
}

export interface CoreContextValue extends CoreProviderProps {
    i18n: I18n;
}
