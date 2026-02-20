import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useDelay } from '../useDelay/useDelay';
import { fn } from '../../../utils';

// prettier-ignore
import {
    AtomicValue,
    type AtomicResetValue,
    type WithAtomicValue,
    type WithAtomicValueOperations,
    type WithAtomicValueState,
} from '../AtomicValue';

// prettier-ignore
import {
    getInitialValue,
    getResolvedValue,
    isAwaitingInitialValue,
    isInitialValue,
    type OptionalInitialValueProps,
    type RequiredInitialValueProps,
    type WithoutInitialValueProps,
} from './initialValue';

// prettier-ignore
export type Atom<T> =
    & WithAtomicValue<T>
    & WithAtomicValueOperations<T>
    & WithAtomicValueState;

export type AtomProps<T> = {
    equals?: (value_1: T, value_2: T) => boolean;
    delay?: number;
};

const defaultEquals = fn(Object.is, undefined);

export function useAtom<T>(props: AtomProps<T> & RequiredInitialValueProps<T>): Atom<T>;
export function useAtom<T = undefined>(props?: AtomProps<T | undefined> & WithoutInitialValueProps): Atom<T | undefined>;
export function useAtom<T = undefined>(props?: AtomProps<T | undefined> & OptionalInitialValueProps<T>): Atom<T | undefined> {
    const _equals: NonNullable<AtomProps<T | undefined>['equals']> = props?.equals ?? defaultEquals;
    const _awaitingInitialValue = isAwaitingInitialValue(props);
    const _initialValue = getInitialValue(props);

    const { cancel, exec } = useDelay({ delay: props?.delay });
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
    const equals = useCallback<Atom<T | undefined>['equals']>(
        compareValue => cachedEquals.current(compareValue, usedValue),
        [usedValue]
    );

    const set = useCallback<Atom<T | undefined>['set']>(
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

    const reset = useMemo<Atom<T | undefined>['reset']>(() => {
        return reset;

        function reset(): void;
        function reset(value: AtomicResetValue | T | undefined): void;
        function reset(...args: [value?: AtomicResetValue | T | undefined]): void {
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
    return useMemo<Atom<T | undefined>>(
        () => ({ equals, pristine, reset, set, stale, value, $value }),
        [equals, pristine, reset, set, stale, value, $value]
    );
}

export default useAtom;
