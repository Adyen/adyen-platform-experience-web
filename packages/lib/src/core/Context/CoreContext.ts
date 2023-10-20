import { createContext } from 'preact';
import { CommonPropsTypes, CoreContextProps } from './types';
import TranslationsManager from './useCoreContext/_translations';

export const CoreContext = createContext<CoreContextProps>({
    i18n: new TranslationsManager().i18n,
    loadingContext: '',
    commonProps: {} as CommonPropsTypes,
});
