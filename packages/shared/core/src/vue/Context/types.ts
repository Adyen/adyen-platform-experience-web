import type { Ref } from 'vue';
import type Localization from '../../Localization';

export type I18n = Localization['i18n'];

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
