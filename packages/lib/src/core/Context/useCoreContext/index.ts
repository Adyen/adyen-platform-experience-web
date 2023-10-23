import { useContext } from 'preact/hooks';
import { CoreContext } from '../CoreContext';
import { UseTranslationsOptions } from '../types';
import _useTranslations from './_useTranslations';

const useCoreContext = (options?: UseTranslationsOptions) => {
    const context = useContext(CoreContext);
    _useTranslations(context.i18n, options);
    return context;
};

export default useCoreContext;
