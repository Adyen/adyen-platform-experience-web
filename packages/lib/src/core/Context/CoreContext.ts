import { createContext } from 'preact';
import { CommonPropsTypes , CoreProviderProps} from './types';
import Localization from '@src/core/Localization';

export const CoreContext = createContext<CoreProviderProps>({ i18n: new Localization().i18n, loadingContext: '', commonProps: {} as CommonPropsTypes });
