import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { CoreContextI18n, UseTranslationsOptions } from '../types';
import { TranslationsLoader, TranslationsScopeRecord } from './_translations/types';

const _useTranslations = (i18n: CoreContextI18n, translationOptions: UseTranslationsOptions = EMPTY_OBJECT) => {
    const { customTranslations, translations } = translationOptions;
    const [, setLastRefresh] = useState(performance.now());
    const doneCallback = useRef(() => setLastRefresh(performance.now()));
    const trashScope = useRef<TranslationsScopeRecord['_trash']>();

    const effectWithUnmountCallback = useMemo(() => {
        const unmount = () => trashScope.current?.();
        return () => unmount;
    }, []);

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
        trashScope.current = i18n.load(translationsLoader, doneCallback.current);
    }, []);

    useMemo(() => {
        trashScope.current?.refresh(translationsLoader, doneCallback.current);
    }, [translationsLoader]);

    useEffect(effectWithUnmountCallback, []);
};

export default _useTranslations;
