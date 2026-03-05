import { AtomicValue, type AtomicResetValue, type Molecule, type MoleculeMember } from './types';

// =============================================================================
// Type helpers
// =============================================================================

// prettier-ignore
type MoleculeMemberType<A> =
    A extends { readonly value: infer T } ? T :
    never;

export type MoleculeValue<M extends Record<string, { readonly value: any }>> = {
    [K in keyof M]: MoleculeMemberType<M[K]>;
};

// Identity mapped type ensures member access yields definite types under noUncheckedIndexedAccess
export type MoleculeConfig<M extends Record<string, MoleculeMember>> = {
    members: { [K in keyof M]: M[K] };
};

// =============================================================================
// Internal utilities
// =============================================================================

const hasOwn = (obj: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(obj, key);

const getCachedValue = <T extends Record<string, any>, K extends keyof T>(
    cache: Readonly<T> | undefined,
    key: K,
    fallback: T[K] | Readonly<T[K]> | undefined
) => {
    return cache ? cache[key] : fallback;
};

const hasCacheStructureChanged = <T extends Record<string, any>>(cache: Readonly<T> | undefined, keys: string[]) => {
    if (!cache || Object.keys(cache).length !== keys.length) return true;
    for (const key of keys) {
        if (!hasOwn(cache, key)) return true;
    }
    return false;
};

// =============================================================================
// Factory
// =============================================================================

export function createMolecule<M extends Record<string, MoleculeMember>>(config: MoleculeConfig<M>): Molecule<MoleculeValue<M>> {
    type T = MoleculeValue<M>;

    let _members = config.members;
    let _keys = Object.keys(_members) as (keyof M & string)[];

    let cachedLatestValue: Readonly<T> | undefined;
    let cachedSnapshotValue: Readonly<T> | undefined;
    let cachedUsedValue: Readonly<T> | undefined;

    const listeners = new Set<() => void>();
    const memberUnsubscribers: (() => void)[] = [];

    let disposed = false;
    let suppressMemberNotifications = false;

    // =========================================================================
    // Value recomputation
    // =========================================================================

    const recompute = () => {
        const latestValue = Object.create(null) as T;
        const snapshotValue = Object.create(null) as T;

        let latestValueChanged = false;
        let snapshotValueChanged = false;
        let shouldUpdateUsedValue = true;

        _keys.forEach(key => {
            const { stale, value, $value } = _members[key];

            latestValueChanged ||= $value !== getCachedValue(cachedLatestValue, key, $value);
            snapshotValueChanged ||= value !== getCachedValue(cachedSnapshotValue, key, value);
            shouldUpdateUsedValue &&= !stale;

            latestValue[key] = $value as T[keyof M];
            snapshotValue[key] = value as T[keyof M];
        });

        const nextLatestValue =
            latestValueChanged || hasCacheStructureChanged(cachedLatestValue, _keys) ? latestValue : (cachedLatestValue ?? latestValue);

        const nextSnapshotValue =
            snapshotValueChanged || hasCacheStructureChanged(cachedSnapshotValue, _keys) ? snapshotValue : (cachedSnapshotValue ?? snapshotValue);

        cachedLatestValue = nextLatestValue;
        cachedSnapshotValue = nextSnapshotValue;

        if (shouldUpdateUsedValue) {
            cachedUsedValue = cachedSnapshotValue = cachedLatestValue;
        } else {
            cachedUsedValue ??= nextSnapshotValue;
        }
    };

    // =========================================================================
    // Notification
    // =========================================================================

    const notify = () => {
        listeners.forEach(fn => fn());
    };

    const onMemberChange = () => {
        if (suppressMemberNotifications) return;

        const prevLatest = cachedLatestValue;
        const prevSnapshot = cachedSnapshotValue;
        const prevUsed = cachedUsedValue;

        recompute();

        if (cachedLatestValue !== prevLatest || cachedSnapshotValue !== prevSnapshot || cachedUsedValue !== prevUsed) {
            notify();
        }
    };

    // =========================================================================
    // Member subscription
    // =========================================================================

    const subscribeToMembers = () => {
        unsubscribeFromMembers();
        _keys.forEach(key => {
            memberUnsubscribers.push(_members[key].subscribe(onMemberChange));
        });
    };

    const unsubscribeFromMembers = () => {
        memberUnsubscribers.forEach(unsub => unsub());
        memberUnsubscribers.length = 0;
    };

    // =========================================================================
    // Operations
    // =========================================================================

    // prettier-ignore
    const equals = (compareValue: Partial<T>): boolean => {
        return _keys.every(key => {
            return hasOwn(compareValue, key)
                ? _members[key].equals(compareValue[key] as T[keyof M])
                : true;
        });
    };

    const set = (value: Partial<T>): void => {
        if (disposed) return;

        // Suppress per-member notifications — recompute once after all members update
        suppressMemberNotifications = true;
        _keys.forEach(key => {
            if (hasOwn(value, key)) {
                _members[key].set(value[key] as T[keyof M]);
            }
        });
        suppressMemberNotifications = false;
        onMemberChange();
    };

    function reset(): void;
    function reset(value: AtomicResetValue | Readonly<T>): void;
    function reset(...args: [value?: AtomicResetValue | Readonly<T>]): void {
        if (disposed) return;

        // Suppress per-member notifications — recompute once after all members update
        suppressMemberNotifications = true;

        if (args.length === 0) {
            _keys.forEach(key => _members[key].reset());
        } else if (args[0] === AtomicValue.INITIAL) {
            _keys.forEach(key => _members[key].reset(AtomicValue.INITIAL));
        } else {
            const resetValue = args[0]!;
            const nextValue = resetValue === AtomicValue.LAST ? instance.value : (resetValue as Readonly<T>);

            _keys.forEach(key => {
                const member = _members[key];
                member.reset(hasOwn(nextValue, key) ? nextValue[key] : (member.value as T[keyof M]));
            });
        }

        suppressMemberNotifications = false;
        onMemberChange();
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
        unsubscribeFromMembers();
        listeners.clear();
        disposed = true;
    };

    const sync = (members: { [K in keyof M]: M[K] }): void => {
        if (_members === members) return;

        const nextKeys = Object.keys(members) as (keyof M & string)[];

        // Compare by subscribe identity — frozen snapshots from the same atom
        // share the same subscribe function, avoiding unnecessary resubscription
        const keysChanged = nextKeys.length !== _keys.length;
        const membersChanged = keysChanged || nextKeys.some(key => members[key].subscribe !== _members[key].subscribe);

        _members = members;
        _keys = nextKeys;

        if (membersChanged) {
            subscribeToMembers();
        }

        recompute();
    };

    // =========================================================================
    // Initialize
    // =========================================================================

    recompute();
    subscribeToMembers();

    // =========================================================================
    // Instance (live getters)
    // =========================================================================

    const instance: Molecule<T> = {
        get value() {
            return cachedUsedValue!;
        },
        get $value() {
            return cachedLatestValue!;
        },
        get $$value() {
            return cachedSnapshotValue!;
        },
        get stale() {
            return !equals(instance.$value);
        },
        get pristine() {
            return _keys.every(key => _members[key].pristine);
        },
        get initialized() {
            return _keys.every(key => _members[key].initialized);
        },
        equals,
        set,
        reset,
        subscribe,
        dispose,
        sync,
    };

    return instance;
}

export default createMolecule;
