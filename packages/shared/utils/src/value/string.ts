import { isNullish, isString } from './is';

export const capitalize = (str?: string) => (str && str?.length > 0 ? `${str[0]!.toUpperCase()}${str.slice(1)}` : str);
export const isEmptyString = (str?: string) => isNullish(str) || (isString(str) && /^\s*$/.test(str));
