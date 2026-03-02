import { useEffect, useMemo, useState } from 'preact/hooks';
import { createAtom, type CreateAtomConfig } from '../core/atom';
import { type WithoutInitialValueProps } from '../core';

// prettier-ignore
import {
    type Atom,
    type AtomConfig,
    type DeferredAtom,
} from '../core';

export function useAtom<T>(props: AtomConfig<T> & { initialValue: T }): Atom<T>;
export function useAtom<T>(props: AtomConfig<T> & { deferredInitialValue: true }): DeferredAtom<T>;
export function useAtom<T = undefined>(props?: AtomConfig<T | undefined> & WithoutInitialValueProps): Atom<T | undefined>;
export function useAtom<T = undefined>(props?: CreateAtomConfig<T>): Atom<T | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- adapter overloads guarantee type safety
    const atom = useMemo(() => createAtom(props as any), []);
    const [, setRenderVersion] = useState(0);

    // Sync mutable config on every render (no notification — values read below)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- internal atom widens equals to (unknown, unknown) => boolean
    atom.reconfigure({ equals: props?.equals as any, delay: props?.delay });

    // Subscribe to atom changes — triggers re-render so parent reads fresh values
    useEffect(() => atom.subscribe(() => setRenderVersion(v => v + 1)), [atom]);

    // Dispose on unmount
    useEffect(() => () => atom.dispose(), [atom]);

    // Read live values for snapshot deps
    const value = atom.value;
    const $value = atom.$value;
    const $$value = atom.$$value;
    const stale = atom.stale;
    const pristine = atom.pristine;
    const initialized = atom.initialized;

    // Frozen snapshot — new reference when observable values change,
    // stable reference otherwise (useMemo). Includes subscribe/dispose
    // so molecules can subscribe to members via the snapshot.
    // prettier-ignore
    return useMemo(
        () => Object.freeze({
            value, $value, $$value, stale, pristine, initialized,
            equals: atom.equals, set: atom.set, reset: atom.reset,
            subscribe: atom.subscribe, dispose: atom.dispose, reconfigure: atom.reconfigure,
        }),
        [value, $value, $$value, stale, pristine, initialized]
    ) as Atom<T | undefined>;
}

export default useAtom;
