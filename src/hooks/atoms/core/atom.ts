import { createDelay } from './delay';
import {
    getInitialValue,
    getResolvedValue,
    isAwaitingInitialValue,
    isInitialValue,
    type InitialValue,
    type OptionalInitialValueProps,
    type WithoutInitialValueProps,
} from './initialValue';
import { AtomicValue, type Atom, type AtomConfig, type DeferredAtom } from './types';

const defaultEquals = Object.is as (a: unknown, b: unknown) => boolean;

// prettier-ignore
export type CreateAtomConfig<T> =
    & AtomConfig<T>
    & OptionalInitialValueProps<T>;

export function createAtom<T>(config: AtomConfig<T> & { initialValue: T }): Atom<T>;
export function createAtom<T>(config: AtomConfig<T> & { deferredInitialValue: true }): DeferredAtom<T>;
export function createAtom<T = undefined>(config?: AtomConfig<T | undefined> & WithoutInitialValueProps): Atom<T | undefined>;
export function createAtom<T = undefined>(config?: CreateAtomConfig<T>): Atom<T | undefined> {
    const _initialValue = getInitialValue(config);

    let _awaitingInitialValue = isAwaitingInitialValue(config);
    let _equalsFn = (config?.equals ?? defaultEquals) as (a: unknown, b: unknown) => boolean;

    let latestValue: T | InitialValue | undefined = _initialValue;
    let committedValue: T | InitialValue | undefined = _initialValue;
    let frozenInitialValue: T | InitialValue | undefined = _initialValue;

    const scheduler = createDelay({ delay: config?.delay });
    const listeners = new Set<() => void>();

    let disposed = false;

    // =========================================================================
    // Notification
    // =========================================================================

    const notify = () => {
        listeners.forEach(fn => fn());
    };

    // =========================================================================
    // Operations
    // =========================================================================

    const equals = (compareValue: T | undefined): boolean => {
        return _equalsFn(compareValue, committedValue);
    };

    const set = (value: T | undefined): void => {
        if (disposed) return;

        // Dedup: same as latest pending value
        if (_equalsFn(latestValue, value)) return;

        // Revert: same as committed value → cancel delay, revert latest
        if (_equalsFn(committedValue, value)) {
            latestValue = committedValue;
            scheduler.cancel();
            notify();
            return;
        }

        latestValue = value;

        // Deferred initialization: first real value freezes initial
        if (_awaitingInitialValue && !isInitialValue(value)) {
            _awaitingInitialValue = false;
            frozenInitialValue = value;
            committedValue = value;
            scheduler.cancel();
            notify();
            return;
        }

        // Schedule commit via delay.
        // If delay=0, exec runs synchronously → committedValue updates inline.
        // If delay>0, exec schedules → committedValue updates later.
        scheduler.exec(() => {
            if (_equalsFn(committedValue, latestValue)) return;
            committedValue = latestValue;
            notify();
        });

        // If delay > 0, the exec above was async — notify now about $value/stale change
        if (!_equalsFn(committedValue, latestValue)) {
            notify();
        }
    };

    function reset(): void;
    function reset(value: T | undefined): void;
    function reset(...args: unknown[]): void {
        if (disposed) return;

        let nextValue = frozenInitialValue;

        if (args.length > 0) {
            switch (args[0]) {
                case AtomicValue.INITIAL:
                    break;
                case AtomicValue.LAST:
                    nextValue = committedValue;
                    break;
                default:
                    nextValue = args[0] as T | undefined;
                    break;
            }
        }

        latestValue = nextValue;
        committedValue = nextValue;
        scheduler.cancel();
        notify();
    }

    // =========================================================================
    // Lifecycle
    // =========================================================================

    const subscribe = (listener: () => void): (() => void) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    const dispose = () => {
        scheduler.dispose();
        listeners.clear();
        disposed = true;
    };

    const reconfigure = (config: Partial<AtomConfig<T | undefined>>): void => {
        if ('equals' in config) {
            _equalsFn = (config.equals ?? defaultEquals) as (a: unknown, b: unknown) => boolean;
        }

        if ('delay' in config) {
            scheduler.reconfigure({ delay: config.delay });
        }
    };

    // =========================================================================
    // Instance (live getters)
    // =========================================================================

    return {
        get value() {
            return getResolvedValue(committedValue);
        },
        get $value() {
            return getResolvedValue(latestValue);
        },
        get $$value() {
            return getResolvedValue(committedValue);
        },
        get stale() {
            return !_equalsFn(committedValue, latestValue);
        },
        get pristine() {
            if (isInitialValue(committedValue) && isInitialValue(frozenInitialValue)) return true;
            if (isInitialValue(committedValue) || isInitialValue(frozenInitialValue)) return false;
            return _equalsFn(committedValue, frozenInitialValue);
        },
        get initialized() {
            return !_awaitingInitialValue || !isInitialValue(committedValue);
        },
        equals,
        set,
        reset,
        subscribe,
        dispose,
        reconfigure,
    } as Atom<T | undefined>;
}

export default createAtom;
