import { enumerable } from '../../../../utils';
import type { BaseEmitter, Emitter } from './types';

export const fromEmitter = <T>(emitter: Emitter<T>): BaseEmitter<T> => {
    const subscribe = ((...args: Parameters<Emitter<T>>) => emitter(...args)) as BaseEmitter<T>;
    return Object.defineProperty(subscribe, Symbol.asyncIterator, enumerable(emitter[Symbol.asyncIterator]));
};

export default fromEmitter;
