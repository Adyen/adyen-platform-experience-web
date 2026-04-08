import { fn } from '../common';
import { boolOrFalse, boolOrTrue } from '../value/bool';
import type { GetterPropertyDescriptor, ValuePropertyDescriptor } from './types';

export const enumerable = <T>(value: T, writable = false): ValuePropertyDescriptor<T> => ({
    writable: boolOrFalse(writable),
    enumerable: true,
    value,
});

export const getter = <T>(get: () => T, enumerable = true): GetterPropertyDescriptor<T> => ({
    enumerable: boolOrTrue(enumerable),
    get,
});

export const hasOwnProperty = fn(Object.prototype.hasOwnProperty);
