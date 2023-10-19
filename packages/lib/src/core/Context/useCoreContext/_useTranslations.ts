import { useEffect, useMemo, useRef } from 'preact/hooks';
import { TranslationsLoader } from '@src/core/Localization/types';
import { EMPTY_OBJECT, noop } from '@src/utils/common';
import { CoreContextI18n, CoreContextScope, CoreContextThis, UseTranslationsOptions } from '../types';

export default function _useTranslations(
    this: any,
    loadTranslations: CoreContextI18n['load'],
    translationOptions: UseTranslationsOptions = EMPTY_OBJECT
) {
    const { customTranslations, translations } = translationOptions;
    const scopeHandle = useRef<CoreContextScope>();
    const scopeUnstack = useRef<ReturnType<CoreContextThis['stack']>>(noop);

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

    const withUnmountCallback = useMemo(() => {
        const _unmount = () => scopeHandle.current?.detach();
        return () => _unmount;
    }, []);

    useMemo(() => {
        scopeHandle.current?.detach();
        scopeHandle.current = void 0;

        if (typeof translationsLoader === 'function') {
            scopeHandle.current = loadTranslations.call(this, translationsLoader);
            scopeUnstack.current = (this as CoreContextThis).stack(scopeHandle.current);
        }
    }, [loadTranslations, translationsLoader]);

    useEffect(() => {
        scopeUnstack.current();
        scopeUnstack.current = noop;
    }, [loadTranslations, translationsLoader]);

    useEffect(withUnmountCallback, []);
}
