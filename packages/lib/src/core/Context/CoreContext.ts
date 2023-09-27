import { createContext } from 'preact';
import { CommonPropsTypes } from './types';
import Localization from '@src/localization';

export const CoreContext = createContext({ i18n: new Localization().i18n, loadingContext: '', commonProps: {} as CommonPropsTypes });
