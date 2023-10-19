import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { TranslationsLoader, TranslationsScopeData } from '@src/core/Localization/types';
import { EMPTY_OBJECT } from '@src/utils/common';
import { ScopeHandle } from '@src/utils/scope/types';
import { CoreContextI18n } from '../types';

export type UseTranslationsOptions = {
    customTranslations?: Record<string, Awaited<ReturnType<TranslationsLoader>>>;
    translations?: Record<string, Awaited<ReturnType<TranslationsLoader>> | (() => ReturnType<TranslationsLoader>)>;
};

const _useTranslations = (loadTranslations: CoreContextI18n['load'], translationOptions: UseTranslationsOptions = EMPTY_OBJECT) => {
    const { customTranslations, translations } = translationOptions;
    const [, setLastRefreshTimestamp] = useState(performance.now());
    const translationsScopeHandle = useRef<ScopeHandle<TranslationsScopeData>>();
    const translationsReadyCallback = useRef(() => setLastRefreshTimestamp(performance.now()));

    const translationsLoader = useMemo(
        () =>
            (customTranslations || translations) &&
            ((async locale => {
                const _translations = translations?.[locale];
                return {
                    ...(typeof _translations === 'function' ? await _translations() : _translations),
                    ...(!!customTranslations?.[locale] && customTranslations[locale]),
                };
            }) as TranslationsLoader),
        [customTranslations, translations]
    );

    useMemo(() => {
        translationsScopeHandle.current?.detach();
        translationsScopeHandle.current = void 0;

        if (typeof translationsLoader === 'function') {
            translationsScopeHandle.current = loadTranslations(translationsLoader, translationsReadyCallback.current);
        }
    }, [loadTranslations, translationsLoader]);

    useEffect(() => () => translationsScopeHandle.current?.detach(), []);
};

export default _useTranslations;
