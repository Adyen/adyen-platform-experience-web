import { ALREADY_RESOLVED_PROMISE } from './constants';
import { PromiseState } from './types';

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

export const tryResolve = <T extends any[]>(fn: (...args: T) => any, ...args: T) => {
    return new Promise(resolve => resolve(fn(...args)));
};
