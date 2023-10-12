import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { TranslationsLoader } from '@src/core/Localization/types';
import { EMPTY_OBJECT, noop } from '@src/utils/common';
import { CoreContextI18n } from '../types';

export type UseTranslationsOptions = {
    customTranslations?: Record<string, Awaited<ReturnType<TranslationsLoader>>>;
    translations?: Record<string, Awaited<ReturnType<TranslationsLoader>> | (() => ReturnType<TranslationsLoader>)>;
};

const _useTranslations = (loadTranslations: CoreContextI18n['load'], translationOptions: UseTranslationsOptions = EMPTY_OBJECT) => {
    const { customTranslations, translations } = translationOptions;
    const [, setLastRefreshTimestamp] = useState(performance.now());
    const unloadTranslations = useRef(noop);
    const translationsReadyCallback = useRef(() => setLastRefreshTimestamp(performance.now()));

    const translationsLoader = useMemo(
        () =>
            (async locale => {
                const _translations = translations?.[locale];
                return {
                    ...(typeof _translations === 'function' ? await _translations() : _translations),
                    ...(!!customTranslations?.[locale] && customTranslations[locale]),
                };
            }) as TranslationsLoader,
        [customTranslations, translations]
    );

    useMemo(() => {
        unloadTranslations.current();
        unloadTranslations.current = loadTranslations(translationsLoader, translationsReadyCallback.current);
    }, [loadTranslations, translationsLoader]);

    useEffect(() => () => unloadTranslations.current(), []);
};

export default _useTranslations;
