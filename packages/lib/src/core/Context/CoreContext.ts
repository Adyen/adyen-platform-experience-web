import { createContext } from 'preact';
import { CommonPropsTypes } from './types';
import Language from '../../language/Language';

export const CoreContext = createContext({ i18n: new Language(), loadingContext: '', commonProps: {} as CommonPropsTypes });
