import { useContext, useMemo } from 'preact/hooks';
import { CoreContext } from '../CoreContext';
import _useTranslations, { UseTranslationsOptions } from './_useTranslations';

export default function _useCoreContext(this: any, options?: UseTranslationsOptions) {
    const context = useContext(CoreContext);
    const loadTranslations = useMemo(() => context.i18n.load.bind(this), [context]);
    _useTranslations(loadTranslations, options);
    return context;
}
