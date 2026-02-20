import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
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
    type InitialValue,
    type OptionalInitialValueProps,
    type WithoutInitialValueProps,
} from './initialValue';

// prettier-ignore
export type Atom<T> =
    & WithAtomicValue<T>
    & WithAtomicValueOperations<T>
    & WithAtomicValueState;

// prettier-ignore
export type DeferredAtom<T> =
    | (Omit<Atom<T>, 'initialized'> & { readonly initialized: true })
    | (Omit<Atom<T>, 'initialized' | 'value' | '$value'> & { readonly initialized: false } & WithAtomicValue<undefined>);

export type AtomProps<T> = {
    equals?: (value_1: T, value_2: T) => boolean;
    delay?: number;
};

const defaultEquals = fn(Object.is, undefined);

export function useAtom<T>(props: AtomProps<T> & { initialValue: T }): Atom<T>;
export function useAtom<T>(props: AtomProps<T> & { deferredInitialValue: true }): DeferredAtom<T>;
export function useAtom<T = undefined>(props?: AtomProps<T | undefined> & WithoutInitialValueProps): Atom<T | undefined>;
export function useAtom<T = undefined>(props?: AtomProps<T | undefined> & OptionalInitialValueProps<T>): Atom<T | undefined> {
    const _equals = (props?.equals ?? defaultEquals) as NonNullable<AtomProps<T | InitialValue | undefined>['equals']>;
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
    const cachedUsedValue = useRef(usedValue);

    // Synchronous — these refs are read during render via the equals callback
    // (e.g. useMolecule's stale computation calls atom.equals)
    cachedEquals.current = _equals;
    cachedUsedValue.current = usedValue;

    if (!_awaitingInitialValue) {
        cachedAwaitingInitialValue.current = false;
    }

    // Derived from props + state — avoids ref read for this computation
    const initialized = !_awaitingInitialValue || !isInitialValue(usedValue);

    // cachedInitialValue is only written in the set callback, never during render
    const pristine = useMemo(() => {
        const initialValue = cachedInitialValue.current;

        if (isInitialValue(usedValue) && isInitialValue(initialValue)) return true;
        if (isInitialValue(usedValue) || isInitialValue(initialValue)) return false;

        return _equals(usedValue, initialValue);
    }, [_equals, usedValue]);

    // prettier-ignore
    const equals = useCallback<Atom<T | undefined>['equals']>(
        compareValue => cachedEquals.current(compareValue, cachedUsedValue.current),
        []
    );

    const set = useCallback<Atom<T | undefined>['set']>(
        value => {
            if (cachedEquals.current(cachedValue.current, value)) return;

            if (cachedEquals.current(cachedUsedValue.current, value)) {
                cachedValue.current = cachedUsedValue.current;
                setLatestValue(cachedUsedValue.current);
                cancel();
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
        [exec, cancel]
    );

    const reset = useMemo<Atom<T | undefined>['reset']>(() => {
        return reset;

        function reset(): void;
        function reset(value: AtomicResetValue | T | undefined): void;
        function reset(...args: [value?: AtomicResetValue | T | undefined]): void {
            let nextValue = cachedInitialValue.current;

            if (args.length > 0) {
                switch (args[0]) {
                    case AtomicValue.INITIAL:
                        break;
                    case AtomicValue.LAST:
                        nextValue = cachedUsedValue.current;
                        break;
                    default:
                        nextValue = args[0] as T | undefined;
                        break;
                }
            }

            cachedValue.current = nextValue;
            setLatestValue(nextValue);
            setUsedValue(nextValue);
            cancel();
        }
    }, [cancel]);

    // prettier-ignore
    return useMemo<Atom<T | undefined>>(
        () => ({ equals, initialized, pristine, reset, set, stale, value, $value }),
        [equals, initialized, pristine, reset, set, stale, value, $value]
    );
}

export default useAtom;
