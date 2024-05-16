type _OmitFirst<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

type _BoundFn<T, Args extends any[]> = Args extends []
    ? T extends (this: infer ThisType, ...args: [...infer RestArgs]) => infer ReturnType
        ? (thisValue: ThisType, ...args: RestArgs) => ReturnType
        : never
    : T extends (this: Args[0], ...args: [..._OmitFirst<Args>, ...infer RestArgs]) => infer ReturnType
    ? (...args: RestArgs) => ReturnType
    : never;

export const fn: <T, Args extends any[]>(func: T, ...args: Args) => _BoundFn<T, Args> = Function.prototype.bind.bind(Function.prototype.call);

export const asyncNoop = async () => {};
export const identity = <T>(value?: T) => value;
export const noop = () => {};

export const panic = (reason?: any) => {
    throw reason;
};

const _toString = fn(Object.prototype.toString);
export const toStringTag = (value?: any) => _toString(value).slice(8, -1);
