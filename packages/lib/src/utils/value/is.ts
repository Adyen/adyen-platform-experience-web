import { toStringTag } from '../common';

export const isBoolean = (value?: any): value is boolean => value === !!value;
export const isFunction = <T extends (...args: any[]) => any>(value?: unknown): value is T => typeof value === 'function';
export const isNull = (value?: any): value is null => value === null;
export const isNullish = (value?: any): value is undefined | null => value == undefined;
export const isNumber = (value?: any): value is number => typeof value === 'number';
export const isPlainObject = <T extends Record<any, any>>(value?: unknown): value is T => toStringTag(value) === 'Object';
export const isString = (value?: any): value is string => typeof value === 'string';
export const isSymbol = (value?: any): value is symbol => typeof value === 'symbol';
export const isUndefined = (value?: any): value is undefined => value === undefined;
