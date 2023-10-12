import Localization from '@src/core/Localization';
import { I18N_EXCLUDED_PROPS } from './constants';

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

export type CoreContextI18n = {
    load: (this: any, ...args: Parameters<Localization['load']>) => ReturnType<Localization['load']>;
} & Omit<Localization['i18n'], (typeof I18N_EXCLUDED_PROPS)[number]>;

export type CoreContextProps = Omit<CoreProviderProps, 'i18n'> & { i18n: CoreContextI18n };
