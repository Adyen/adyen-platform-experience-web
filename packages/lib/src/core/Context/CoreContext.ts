import { createContext } from 'preact';
import { CommonPropsTypes, CoreContextProps } from './types';
import Localization from '@src/core/Localization';

export const CoreContext = createContext<CoreContextProps>({
    i18n: new Localization().i18n,
    loadingContext: '',
    commonProps: {} as CommonPropsTypes,
});
