import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { TranslationsContextThisBinding, UseTranslationsOptions } from '../types';
import { TranslationsLoader, TranslationsScopeRecord } from '../types';

export default function _useTranslations(this: unknown, translationOptions: UseTranslationsOptions = EMPTY_OBJECT) {
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

    if (!trashScope.current) {
        try {
            trashScope.current = (this as TranslationsContextThisBinding).load(translationsLoader, doneCallback.current);
        } catch {
            throw new Error('Illegal invocation');
        }
    } else trashScope.current.refresh?.(translationsLoader, doneCallback.current);

    useEffect(effectWithUnmountCallback, []);
}
