import { enumerable, struct } from '../../../utils';
import type { EffectStack } from './types';

const _NO_EXCEPTION = Symbol('<<NO_EXCEPTION>>');

export const createEffectStack = <Effect extends (...args: any[]) => any>(effect: Effect) => {
    const _stack: any[] = [];

    const _bindFn: EffectStack<Effect>['bind'] = fn =>
        function (this: unknown, ...args) {
            let exception: unknown = _NO_EXCEPTION;
            try {
                _stack.push(fn);
                return fn.call(this, ...args);
            } catch (ex) {
                throw (exception = ex);
            } finally {
                _stack.pop();
                if (_stack.length === 0 && exception === _NO_EXCEPTION) effect();
            }
        } as typeof fn;

    return struct<EffectStack<Effect>>({
        bind: enumerable(_bindFn),
        effect: enumerable(effect),
    });
};

export default createEffectStack;
