import { createContext } from 'preact';
import { CommonPropsTypes } from './types';
import Localization from '@src/localization';

export const CoreContext = createContext({ i18n: new Localization(), loadingContext: '', commonProps: {} as CommonPropsTypes });
