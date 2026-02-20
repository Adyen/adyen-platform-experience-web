import type { Atom, DeferredAtom } from '../useAtom/useAtom';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'preact/hooks';
import { getCachedValue, hasCacheStructureChanged } from './cachedValue';
import { hasOwnProperty } from '../../../utils';

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

// prettier-ignore
type MoleculeMemberType<A> =
    A extends Atom<infer T> ? T :
    A extends DeferredAtom<infer T> ? T :
    A extends Molecule<infer T> ? T :
    never;

export type MoleculeMember = Atom<any> | DeferredAtom<any> | Molecule<any>;

// Identity mapped type ensures member access yields definite types under noUncheckedIndexedAccess
export type MoleculeProps<M extends Record<string, MoleculeMember>> = {
    members: { [K in keyof M]: M[K] };
};

export type MoleculeValue<M extends Record<string, MoleculeMember>> = {
    [K in keyof M]: MoleculeMemberType<M[K]>;
};

export const useMolecule = <M extends Record<string, MoleculeMember>>({ members }: MoleculeProps<M>): Molecule<MoleculeValue<M>> => {
    const cachedLatestValue = useRef<Readonly<MoleculeValue<M>>>();
    const cachedSnapshotValue = useRef<Readonly<MoleculeValue<M>>>();
    const cachedUsedValue = useRef<Readonly<MoleculeValue<M>>>();

    const keys = useMemo(() => Object.keys(members) as (keyof M & string)[], [members]);

    const {
        latestValue: $value,
        snapshotValue: $$value,
        usedValue: value,
    } = useMemo(() => {
        const latestValue = {} as MoleculeValue<M>;
        const snapshotValue = {} as MoleculeValue<M>;

        let latestValueChanged = false;
        let snapshotValueChanged = false;
        let shouldUpdateUsedValue = true;

        keys.forEach(key => {
            const { stale, value, $value } = members[key];

            latestValueChanged ||= $value !== getCachedValue(cachedLatestValue.current, key, $value);
            snapshotValueChanged ||= value !== getCachedValue(cachedSnapshotValue.current, key, value);
            shouldUpdateUsedValue &&= !stale;

            latestValue[key] = $value as MoleculeValue<M>[keyof M];
            snapshotValue[key] = value as MoleculeValue<M>[keyof M];
        });

        const nextLatestValue =
            latestValueChanged || hasCacheStructureChanged(cachedLatestValue.current, keys)
                ? latestValue
                : (cachedLatestValue.current ?? latestValue);

        const nextSnapshotValue =
            snapshotValueChanged || hasCacheStructureChanged(cachedSnapshotValue.current, keys)
                ? snapshotValue
                : (cachedSnapshotValue.current ?? snapshotValue);

        if (shouldUpdateUsedValue) {
            return {
                latestValue: nextLatestValue,
                snapshotValue: nextLatestValue,
                usedValue: nextLatestValue,
            } as const;
        }

        return {
            latestValue: nextLatestValue,
            snapshotValue: nextSnapshotValue,
            usedValue: cachedUsedValue.current ?? nextSnapshotValue,
        } as const;
    }, [members, keys]);

    // Sync refs after commit — read only during next render's useMemo for change detection
    useLayoutEffect(() => {
        cachedLatestValue.current = $value;
        cachedSnapshotValue.current = $$value;
        cachedUsedValue.current = value;
    }, [$value, $$value, value]);

    // prettier-ignore
    const equals = useCallback<Molecule<MoleculeValue<M>>['equals']>(
        compareValue =>
            keys.every(key => {
                return hasOwnProperty(compareValue, key)
                    ? members[key].equals(compareValue[key] as MoleculeValue<M>[keyof M])
                    : true;
            }),
        [members, keys]
    );

    const set = useCallback<Molecule<MoleculeValue<M>>['set']>(
        value => {
            keys.forEach(key => {
                if (hasOwnProperty(value, key)) {
                    members[key].set(value[key] as MoleculeValue<M>[keyof M]);
                }
            });
        },
        [members, keys]
    );

    const reset = useMemo<Molecule<MoleculeValue<M>>['reset']>(() => {
        return reset;

        function reset(): void;
        function reset(value: AtomicResetValue | Readonly<MoleculeValue<M>>): void;
        function reset(...args: [value?: AtomicResetValue | Readonly<MoleculeValue<M>>]): void {
            if (args.length === 0) {
                keys.forEach(key => members[key].reset());
            } else if (args[0] === AtomicValue.INITIAL) {
                keys.forEach(key => members[key].reset(AtomicValue.INITIAL));
            } else {
                const resetValue = args[0]!;
                const nextValue = resetValue === AtomicValue.LAST ? value : (resetValue as Readonly<MoleculeValue<M>>);

                keys.forEach(key => {
                    const member = members[key];
                    member.reset(hasOwnProperty(nextValue, key) ? nextValue[key] : (member.value as MoleculeValue<M>[keyof M]));
                });
            }
        }
    }, [members, keys, value]);

    // prettier-ignore
    const initialized = useMemo(
        () => keys.every(key => members[key].initialized),
        [members, keys]
    );

    // prettier-ignore
    const pristine = useMemo(
        () => keys.every(key => members[key].pristine),
        [members, keys]
    );

    const stale = useMemo(() => !equals($value), [equals, $value]);

    // prettier-ignore
    return useMemo(
        () => ({ equals, initialized, pristine, reset, set, stale, value, $value, $$value }),
        [equals, initialized, pristine, reset, set, stale, value, $value, $$value]
    );
};

export default useMolecule;
