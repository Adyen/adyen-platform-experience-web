import { createContext } from 'preact';
import { noop } from '../../utils';
import { CommonPropsTypes, CoreProviderProps } from './types';
import Localization from '../Localization';

export const CoreContext = createContext<CoreProviderProps & { i18n: Localization['i18n'] }>({
    i18n: new Localization().i18n,
    loadingContext: '',
    theme: 'light',
    commonProps: {} as CommonPropsTypes,
    updateCore: noop,
    componentRef: { current: null },
});
