import { useEffect, useMemo, useState } from 'preact/hooks';
import { createMolecule, type MoleculeValue } from '../core/molecule';

// prettier-ignore
import type {
    Atom,
    DeferredAtom,
    Molecule,
} from '../core/types';

// Atom/DeferredAtom/Molecule all include subscribe/dispose
type HookMoleculeMember = Atom<any> | DeferredAtom<any> | Molecule<any>;

// Identity mapped type ensures member access yields definite types under noUncheckedIndexedAccess
export type MoleculeProps<M extends Record<string, HookMoleculeMember>> = {
    members: { [K in keyof M]: M[K] };
};

export const useMolecule = <M extends Record<string, HookMoleculeMember>>({ members }: MoleculeProps<M>): Molecule<MoleculeValue<M>> => {
    type T = MoleculeValue<M>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- adapter props guarantee type safety
    const mol = useMemo(() => createMolecule({ members } as any), []) as Molecule<T>;
    const [, setRenderVersion] = useState(0);

    // Sync members on every render (handles dynamic member changes; no-op if unchanged)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- adapter props guarantee type safety
    mol.sync(members as any);

    // Subscribe to molecule changes — triggers re-render so parent reads fresh values
    useEffect(() => mol.subscribe(() => setRenderVersion(v => v + 1)), [mol]);

    // Dispose on unmount
    useEffect(() => () => mol.dispose(), [mol]);

    // Read live values for snapshot deps
    const value = mol.value;
    const $value = mol.$value;
    const $$value = mol.$$value;
    const stale = mol.stale;
    const pristine = mol.pristine;
    const initialized = mol.initialized;

    // Frozen snapshot — new reference when observable values change,
    // stable reference otherwise (useMemo). Includes subscribe/dispose/sync
    // so nested molecules can subscribe to this molecule via the snapshot.
    // prettier-ignore
    return useMemo(
        () => Object.freeze({
            value, $value, $$value, stale, pristine, initialized,
            equals: mol.equals, set: mol.set, reset: mol.reset,
            subscribe: mol.subscribe, dispose: mol.dispose, sync: mol.sync,
        }),
        [value, $value, $$value, stale, pristine, initialized]
    ) as Molecule<T>;
};

export default useMolecule;
