import Localization from '../Localization';
import { onErrorHandler } from '../types';
import { RefObject } from 'preact';
import { AssetOptions } from '../Assets/Assets';

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
    componentRef: RefObject<HTMLDivElement>;
    getImageAsset?: (props: AssetOptions) => string;
    getCdnConfig?: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
}
