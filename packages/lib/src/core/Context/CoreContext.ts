import { createContext } from 'preact';
import { CommonPropsTypes, CoreContextWithTranslations } from './types';
import TranslationsManager from './useCoreContext/translations';

export const CoreContext = createContext<CoreContextWithTranslations>({
    i18n: new TranslationsManager().i18n,
    loadingContext: '',
    commonProps: {} as CommonPropsTypes,
});
