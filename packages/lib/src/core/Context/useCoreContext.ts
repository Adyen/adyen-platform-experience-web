import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { TranslationsLoader } from '@src/core/Localization/types';
import { CoreContext } from './CoreContext';
import { noop } from '@src/utils/common';

const useCoreContext = <T extends Record<string, () => ReturnType<TranslationsLoader>>>(translations?: T) => {
    const [, setLastRefreshTimestamp] = useState(performance.now());
    const context = useContext(CoreContext);
    const unloadTranslations = useRef(noop);
    const translationsReadyCallback = useRef(() => setLastRefreshTimestamp(performance.now()));

    const loadTranslations = useMemo(() => {
        if (translations) return (async locale => translations[locale]?.()) as TranslationsLoader;
    }, [translations]);

    useEffect(() => () => unloadTranslations.current(), []);

    return useMemo(() => {
        unloadTranslations.current();
        unloadTranslations.current = context.i18n.load(loadTranslations, translationsReadyCallback.current);
        return context;
    }, [context, loadTranslations]);
};

export default useCoreContext;
