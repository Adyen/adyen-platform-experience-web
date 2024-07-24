import { toStringTag } from '../common';
import type { GetPredicateType } from '../types';

export const isBoolean = (value?: any): value is boolean => value === !!value;
export const isFunction = <T>(value?: T): value is GetPredicateType<(...args: any[]) => any, T> => typeof value === 'function';
export const isNull = (value?: any): value is null => value === null;
export const isNullish = (value?: any): value is undefined | null => value == undefined;
export const isNumber = (value?: any): value is number => typeof value === 'number';
export const isPlainObject = <T>(value?: T): value is GetPredicateType<Record<any, any>, T> => toStringTag(value) === 'Object';
export const isString = (value?: any): value is string => typeof value === 'string';
export const isSymbol = (value?: any): value is symbol => typeof value === 'symbol';
export const isUndefined = (value?: any): value is undefined => value === undefined;
