import { useContext, useEffect, useMemo, useRef } from 'preact/hooks';
import { CoreContext } from './CoreContext';
import { noop } from '@src/utils/common';
import { TranslationsLoader } from '@src/core/Localization/Localization';

const useCoreContext = (loadTranslations?: TranslationsLoader) => {
    const context = useContext(CoreContext);
    const unloadTranslations = useRef(noop);

    useEffect(() => () => unloadTranslations.current(), []);

    return useMemo(() => {
        unloadTranslations.current();
        unloadTranslations.current = context.i18n.load(loadTranslations);
        return context;
    }, [context, loadTranslations]);
};

export default useCoreContext;
