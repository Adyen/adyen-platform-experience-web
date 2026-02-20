import type { AtomicValue as AtomicValueType, AtomResult } from '../shared/types';

import { AtomicValue } from '../shared/constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useDelay } from './useDelay';
import { fn } from '../../../utils';

import {
    getInitialValue,
    getResolvedValue,
    isAwaitingInitialValue,
    isInitialValue,
    OptionalInitialValueProps,
    WithInitialValueProps,
    WithoutInitialValueProps,
} from './initialValue';

export interface AtomProps<T> {
    equals?: (value_1: T, value_2: T) => boolean;
    delay?: number;
}

const defaultEquals = fn(Object.is, undefined);

export function useAtom<T>(props: AtomProps<T> & WithInitialValueProps<T>): AtomResult<T>;
export function useAtom<T = undefined>(props?: AtomProps<T | undefined> & WithoutInitialValueProps): AtomResult<T | undefined>;
export function useAtom<T = undefined>(props?: AtomProps<T | undefined> & OptionalInitialValueProps<T>): AtomResult<T | undefined> {
    const _equals: NonNullable<AtomProps<T | undefined>['equals']> = props?.equals ?? defaultEquals;
    const _awaitingInitialValue = isAwaitingInitialValue(props);
    const _initialValue = getInitialValue(props);

    const { cancel, exec } = useDelay(props?.delay);
    const [latestValue, setLatestValue] = useState(_initialValue);
    const [usedValue, setUsedValue] = useState(latestValue);

    const stale = !_equals(usedValue, latestValue);
    const value = getResolvedValue(usedValue);
    const $value = getResolvedValue(latestValue);

    const cachedEquals = useRef(_equals);
    const cachedAwaitingInitialValue = useRef(_awaitingInitialValue);
    const cachedInitialValue = useRef(latestValue);
    const cachedValue = useRef(latestValue);

    const pristine = useMemo(() => {
        const initialValue = cachedInitialValue.current;

        if (isInitialValue(usedValue) && isInitialValue(initialValue)) return true;
        if (isInitialValue(usedValue) || isInitialValue(initialValue)) return false;

        return _equals(usedValue, initialValue);
    }, [_equals, usedValue]);

    // prettier-ignore
    const equals = useCallback<AtomResult<T | undefined>['equals']>(
        compareValue => cachedEquals.current(compareValue, usedValue),
        [usedValue]
    );

    const set = useCallback<AtomResult<T | undefined>['set']>(
        value => {
            const latestValue = cachedValue.current;

            if (cachedEquals.current(latestValue, value)) return;
            if (cachedEquals.current(usedValue, value)) {
                cachedValue.current = usedValue;
                setLatestValue(usedValue);
                return;
            }

            cachedValue.current = value;
            setLatestValue(value);

            if (cachedAwaitingInitialValue.current && !isInitialValue(value)) {
                cachedAwaitingInitialValue.current = false;
                cachedInitialValue.current = value;
                setUsedValue(value);
            } else {
                exec(() => {
                    setUsedValue(usedValue => {
                        return cachedEquals.current(usedValue, value) ? usedValue : value;
                    });
                });
            }
        },
        [exec, usedValue]
    );

    const reset = useMemo<AtomResult<T | undefined>['reset']>(() => {
        return reset;

        function reset(): void;
        function reset(value: AtomicValueType | T | undefined): void;
        function reset(...args: [value?: AtomicValueType | T | undefined]): void {
            let nextValue = (cachedValue.current = cachedInitialValue.current);

            if (args.length > 0) {
                switch (args[0]) {
                    case AtomicValue.INITIAL:
                        break;
                    case AtomicValue.LAST:
                        nextValue = usedValue;
                        break;
                    default:
                        nextValue = args[0] as T | undefined;
                        break;
                }
            }

            setLatestValue(nextValue);
            setUsedValue(nextValue);
            cancel();
        }
    }, [cancel, usedValue]);

    useEffect(() => {
        if (!_awaitingInitialValue) {
            cachedAwaitingInitialValue.current = false;
            cachedInitialValue.current = _initialValue;
        }
        cachedEquals.current = _equals;
    }, [_awaitingInitialValue, _equals, _initialValue]);

    // prettier-ignore
    return useMemo<AtomResult<T | undefined>>(
        () => ({ equals, pristine, reset, set, stale, value, $value }),
        [equals, pristine, reset, set, stale, value, $value]
    );
}

export default useAtom;
