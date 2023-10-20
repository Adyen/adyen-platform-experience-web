import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { CoreContextI18n, CoreContextScope, UseTranslationsOptions } from '../types';
import { TranslationsLoader } from './_translations/types';

const _useTranslations = (loadTranslations: CoreContextI18n['load'], translationOptions: UseTranslationsOptions = EMPTY_OBJECT) => {
    const { customTranslations, translations } = translationOptions;
    const [, setLastRefresh] = useState(performance.now());
    const scopeHandle = useRef<CoreContextScope>();

    const doneCallback = useRef((err: Error | null) => {
        if (err === null) return setLastRefresh(performance.now());
        if (!scopeHandle.current?._scope) return;
        // const scope = scopeHandle.current._scope;
    });

    const effectWithUnmountCallback = useMemo(() => {
        const unmount = () => scopeHandle.current?.detach();
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
        scopeHandle.current?.detach();
        scopeHandle.current = void 0;

        if (typeof translationsLoader === 'function') {
            scopeHandle.current = loadTranslations.call(this, translationsLoader, doneCallback.current);
        }
    }, [loadTranslations, translationsLoader]);

    useEffect(effectWithUnmountCallback, []);
};

export default _useTranslations;
