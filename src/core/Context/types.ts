import Localization from '../Localization';
import { onErrorHandler } from '../types';
import { AssetOptions } from '../Assets/Assets';

export type ComponentRef<T = HTMLDivElement> = () => T | null;

export interface CommonPropsTypes {
    isCollatingErrors?: boolean;
}

export interface CoreProviderProps {
    children?: any;
    commonProps?: CommonPropsTypes;
    i18n?: Localization['i18n'];
    loadingContext?: string;
    updateCore?: () => void;
    externalErrorHandler?: onErrorHandler | null;
    componentRef: ComponentRef<HTMLDivElement>;
    getImageAsset?: (props: AssetOptions) => string;
    getDatasetAsset?: (props: AssetOptions) => string;
    getCdnConfig?: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    getCdnDataset?: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
}
