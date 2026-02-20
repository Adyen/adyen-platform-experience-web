import { useCallback, useMemo, useRef } from 'preact/hooks';
import { getCachedValue, hasCacheStructureChanged } from './cachedValue';
import { hasOwnProperty } from '../../../utils';
import type { Atom } from '../useAtom/useAtom';

// prettier-ignore
import {
    AtomicValue,
    type AtomicResetValue,
    type WithAtomicValue,
    type WithAtomicValueOperations,
    type WithAtomicValueState,
} from '../AtomicValue';

// prettier-ignore
export type Molecule<T extends Record<string, any>> =
    & { $$value: Readonly<T> }
    & WithAtomicValue<Readonly<T>>
    & WithAtomicValueOperations<Partial<T>, Readonly<T>>
    & WithAtomicValueState;

export type MoleculeProps<T extends Record<string, any>> = {
    members: { [K in keyof T]: T[K] extends Molecule<T[K]> ? Molecule<T[K]> : Atom<T[K]> };
};

export const useMolecule = <T extends Record<string, any>>({ members }: MoleculeProps<T>): Molecule<T> => {
    const cachedLatestValue = useRef<Readonly<T>>();
    const cachedSnapshotValue = useRef<Readonly<T>>();
    const cachedUsedValue = useRef<Readonly<T>>();

    const keys = useMemo(() => Object.keys(members) as (keyof T)[], [members]);

    const {
        latestValue: $value,
        snapshotValue: $$value,
        usedValue: value,
    } = useMemo(() => {
        const latestValue = {} as T;
        const snapshotValue = {} as T;

        let latestValueChanged = false;
        let snapshotValueChanged = false;
        let shouldUpdateUsedValue = true;

        keys.forEach(key => {
            const { stale, value, $value } = members[key];

            latestValueChanged ||= $value !== getCachedValue(cachedLatestValue.current, key, $value);
            snapshotValueChanged ||= value !== getCachedValue(cachedSnapshotValue.current, key, value);
            shouldUpdateUsedValue &&= !stale;

            latestValue[key] = $value as T[keyof T];
            snapshotValue[key] = value as T[keyof T];
        });

        cachedLatestValue.current ??= latestValue;
        cachedSnapshotValue.current ??= snapshotValue;
        cachedUsedValue.current ??= snapshotValue;

        if (latestValueChanged || hasCacheStructureChanged(cachedLatestValue.current, keys)) {
            cachedLatestValue.current = latestValue;
        }

        if (snapshotValueChanged || hasCacheStructureChanged(cachedSnapshotValue.current, keys)) {
            cachedSnapshotValue.current = snapshotValue;
        }

        if (shouldUpdateUsedValue) {
            cachedUsedValue.current = cachedSnapshotValue.current = cachedLatestValue.current;
        }

        return {
            latestValue: cachedLatestValue.current,
            snapshotValue: cachedSnapshotValue.current,
            usedValue: cachedUsedValue.current,
        } as const;
    }, [members, keys]);

    // prettier-ignore
    const equals = useCallback<Molecule<T>['equals']>(
        compareValue =>
            keys.every(key => {
                return hasOwnProperty(compareValue, key)
                    ? members[key].equals(compareValue[key] as T[keyof T])
                    : true;
            }),
        [members, keys]
    );

    const set = useCallback<Molecule<T>['set']>(
        value => {
            keys.forEach(key => {
                if (hasOwnProperty(value, key)) {
                    members[key].set(value[key] as T[keyof T]);
                }
            });
        },
        [members, keys]
    );

    const reset = useMemo<Molecule<T>['reset']>(() => {
        return reset;

        function reset(): void;
        function reset(value: AtomicResetValue | Readonly<T>): void;
        function reset(...args: [value?: AtomicResetValue | Readonly<T>]): void {
            if (args.length === 0) {
                keys.forEach(key => members[key].reset());
            } else if (args[0] === AtomicValue.INITIAL) {
                keys.forEach(key => members[key].reset(AtomicValue.INITIAL));
            } else {
                const resetValue = args[0]!;
                const nextValue = resetValue === AtomicValue.LAST ? value : (resetValue as Readonly<T>);

                keys.forEach(key => {
                    const member = members[key];
                    member.reset(hasOwnProperty(nextValue, key) ? nextValue[key] : member.value);
                });
            }
        }
    }, [members, keys, value]);

    // prettier-ignore
    const pristine = useMemo(
        () => keys.every(key => members[key].pristine),
        [members, keys]
    );

    const stale = useMemo(() => !equals($value), [equals, $value]);

    // prettier-ignore
    return useMemo(
        () => ({ equals, pristine, reset, set, stale, value, $value, $$value }),
        [equals, pristine, reset, set, stale, value, $value, $$value]
    );
};

export default useMolecule;
