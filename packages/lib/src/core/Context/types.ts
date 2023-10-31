import Localization from '@src/core/Localization';
import { WithTranslationsI18n } from './useCoreContext/translations/types';

export interface CommonPropsTypes {
    isCollatingErrors?: boolean;
}

export interface CoreProviderProps {
    children?: any;
    commonProps?: CommonPropsTypes;
    i18n?: Localization['i18n'];
    loadingContext?: string;
    clientKey?: string;
}

export type CoreContextWithTranslations = WithTranslationsI18n<CoreProviderProps>;
export type CoreContextWithTranslationsI18n = CoreContextWithTranslations['i18n'];
