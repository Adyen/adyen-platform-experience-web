import { isFunction } from '../../../utils';
import { TranslationFill } from './types';

export const normalizeTranslationFill = (fill: TranslationFill) => (isFunction(fill) ? fill() : fill);
