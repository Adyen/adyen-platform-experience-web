import type { ListWithoutFirst } from './types';

type _BoundFn<T, Args extends any[]> = Args extends []
    ? T extends (this: infer ThisType, ...args: [...infer RestArgs]) => infer ReturnType
        ? (thisValue: ThisType, ...args: RestArgs) => ReturnType
        : never
    : T extends (this: Args[0], ...args: [...ListWithoutFirst<Args>, ...infer RestArgs]) => infer ReturnType
    ? (...args: RestArgs) => ReturnType
    : never;

type _NestedObjectProp<T extends object, K extends keyof T> = K extends K ? (T[K] extends object ? K : never) : never;

type NestedObjectProp<T extends object> = Extract<keyof T, _NestedObjectProp<T, keyof T>>;

export type DeepReadonly<T> = T extends object
    ? Omit<Readonly<T>, NestedObjectProp<T>> & Readonly<{ [K in NestedObjectProp<T>]: DeepReadonly<T[K]> }>
    : T;

export const fn: <T, Args extends any[]>(func: T, ...args: Args) => _BoundFn<T, Args> = Function.prototype.bind.bind(Function.prototype.call);

// prettier-ignore
export const constant = <T>(value?: T) => () => value;

export const asyncNoop = async () => {};
export const identity = <T>(value?: T) => value;
export const noop = () => {};

export const panic = (reason?: any) => {
    throw reason;
};

const _toString = fn(Object.prototype.toString);
export const toStringTag = (value?: any) => _toString(value).slice(8, -1);

export const deepFreeze = <T extends object>(obj: T): DeepReadonly<T> => {
    Object.keys(obj).forEach(prop => {
        const value = obj[prop as keyof T];
        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            deepFreeze(value);
        }
    });
    return Object.freeze(obj) as DeepReadonly<T>;
};
