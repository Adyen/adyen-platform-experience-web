import { createContext } from 'preact';
import { noop } from '../../utils';
import { CommonPropsTypes, CoreProviderProps } from './types';
import Localization from '../Localization';
import { FALLBACK_ENV } from '../utils';

export const CoreContext = createContext<CoreProviderProps>({
    i18n: new Localization().i18n,
    loadingContext: '',
    commonProps: {} as CommonPropsTypes,
    updateCore: noop,
    componentRef: { current: null },
    environment: FALLBACK_ENV,
});
