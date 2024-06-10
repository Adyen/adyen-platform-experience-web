import { ALREADY_RESOLVED_PROMISE } from './constants';
import { Promised, PromiseState } from '../types';

const _pending = () => _PENDING;
const _PENDING: unique symbol = Symbol('<<PENDING>>');

export const getPromiseState = async (promise: Promise<any>): Promise<PromiseState> => {
    try {
        const value = await Promise.race([promise, ALREADY_RESOLVED_PROMISE.then(_pending)]);
        return value === _PENDING ? PromiseState.PENDING : PromiseState.FULFILLED;
    } catch {
        return PromiseState.REJECTED;
    }
};

export const tryResolve = function <Fn extends (this: any, ...args: any[]) => Promised<any>>(
    this: ThisParameterType<Fn>,
    fn: Fn,
    ...args: Parameters<Fn>
) {
    return new Promise<Awaited<ReturnType<Fn>>>(resolve => resolve(fn.call(this, ...args)));
};
