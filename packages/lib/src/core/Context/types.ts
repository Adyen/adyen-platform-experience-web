import Localization from '@src/core/Localization';
import TranslationsManager from './useCoreContext/_translations';
import { TranslationsLoader } from './useCoreContext/_translations/types';

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

export type CoreContextI18n = TranslationsManager['i18n'];
export type CoreContextProps = Omit<CoreProviderProps, 'i18n'> & { i18n: CoreContextI18n };

export type UseTranslationsOptions = {
    customTranslations?: Record<string, Awaited<ReturnType<TranslationsLoader>>>;
    translations?: Record<string, Awaited<ReturnType<TranslationsLoader>> | (() => ReturnType<TranslationsLoader>)>;
};
