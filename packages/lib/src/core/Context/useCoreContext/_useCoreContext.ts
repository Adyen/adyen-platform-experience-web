import { useContext } from 'preact/hooks';
import { CoreContext } from '../CoreContext';
import { UseTranslationsOptions } from '../types';
import _useTranslations from './_useTranslations';

export default function _useCoreContext(this: any, options?: UseTranslationsOptions) {
    const context = useContext(CoreContext);
    _useTranslations.call(this, context.i18n.load, options);
    return context;
}
