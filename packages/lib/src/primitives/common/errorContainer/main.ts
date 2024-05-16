import { enumerable, getter, struct } from '../../utils';
import type { ErrorContainer } from './types';

const _NO_ERR: unique symbol = Symbol('<<NO_ERR>>');

function _assertError<T>(error: any): asserts error is T {
    /* istanbul ignore if -- @preserve */
    if (error === _NO_ERR) {
        // Code execution should never reach this block.
        // If it does, then the consumer is doing something wrong.
        // The consumer needs to call the `reset()` method instead.
        throw new TypeError('Illegal error');
    }
}

export const createErrorContainer = <T = unknown>() => {
    let _error: T | typeof _NO_ERR = _NO_ERR;

    const _resetError = () => {
        _error = _NO_ERR;
    };

    const _setError = (error: T) => {
        _assertError<T>(error);
        _error = error;
    };

    return struct({
        error: getter(() => (_error === _NO_ERR ? undefined : _error)),
        hasError: getter(() => _error !== _NO_ERR),
        reset: enumerable(_resetError),
        set: enumerable(_setError),
    }) as ErrorContainer<T>;
};

export default createErrorContainer;
