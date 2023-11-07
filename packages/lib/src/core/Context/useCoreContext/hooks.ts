import { struct } from '@src/utils/common';
import Localization from '@src/core/Localization';
import TranslationsManager from './translations';
import _useCoreContext from './_useCoreContext';
import useTranslationsI18n from './translations/hooks/_useTranslationsI18n';
import { TranslationsContextThisBinding } from './translations/types';

export const { useCoreContext, _useTranslationsI18n } = (() => {
    const translationsManager = new TranslationsManager();
    const __load__ = translationsManager.load.bind(translationsManager);

    const translationsContextThisBinding = struct({
        i18n: {
            get: () => translationsManager.i18n,
            set: (i18n: Localization['i18n']) => {
                translationsManager.i18n = i18n;
            },
        },
        load: {
            value(this: unknown, ...args: Parameters<typeof __load__>) {
                if (this === translationsContextThisBinding) return __load__(...args);
                throw new Error('Illegal invocation');
            },
        },
        reset: { value: translationsManager.reset.bind(translationsManager) },
    }) as TranslationsContextThisBinding;

    return {
        useCoreContext: _useCoreContext.bind(translationsContextThisBinding),
        _useTranslationsI18n: useTranslationsI18n.bind(translationsContextThisBinding),
    };
})();

export default useCoreContext;
