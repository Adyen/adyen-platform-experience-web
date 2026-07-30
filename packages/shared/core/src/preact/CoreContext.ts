import { createContext } from 'preact';
import { noop } from '@integration-components/utils';
import Localization from '../Localization';
import { FALLBACK_ENV } from '../utils';
import type { CommonPropsTypes, CoreProviderProps } from '../CoreContext.types';

export const CoreContext = createContext<CoreProviderProps>({
    i18n: new Localization().i18n,
    loadingContext: '',
    commonProps: {} as CommonPropsTypes,
    updateCore: noop,
    componentRef: () => null,
    environment: FALLBACK_ENV,
});
