import Localization from '../Localization';
import { onErrorHandler } from '../types';
import { RefObject } from 'preact';
import { Resources } from '../Resources/Resources';

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
    resources: Resources;
}
