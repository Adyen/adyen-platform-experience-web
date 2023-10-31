import { useContext } from 'preact/hooks';
import { CoreContext } from '../CoreContext';
import { UseTranslationsOptions } from './translations/types';
import _useTranslations from './translations/hooks/_useTranslations';

export default function _useCoreContext(this: unknown, options?: UseTranslationsOptions) {
    const context = useContext(CoreContext);
    _useTranslations.call(this, options);
    return context;
}
