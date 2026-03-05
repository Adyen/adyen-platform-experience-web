const $initialAtomicValue = Symbol();
const $lastAtomicValue = Symbol();

// prettier-ignore
export type AtomicResetValue =
    | typeof $initialAtomicValue
    | typeof $lastAtomicValue;

interface AtomicValueReset<T> {
    (value: T | AtomicResetValue): void;
    (): void;
}

export type WithAtomicValue<T> = {
    readonly value: T;
    readonly $value: T;
    readonly $$value: T;
};

export type WithAtomicValueOperations<T, ResetValue = T> = {
    readonly equals: (value: T) => boolean;
    readonly reset: AtomicValueReset<ResetValue>;
    readonly set: (value: T) => void;
};

export type WithAtomicValueState = {
    readonly initialized: boolean;
    readonly pristine: boolean;
    readonly stale: boolean;
};

export const AtomicValue = {
    INITIAL: $initialAtomicValue,
    LAST: $lastAtomicValue,
} as const;

// =============================================================================
// Lifecycle interfaces
// =============================================================================

export interface Subscribable {
    subscribe(listener: () => void): () => void;
}

export interface Disposable {
    dispose(): void;
}

// =============================================================================
// Atom
// =============================================================================

export type AtomConfig<T> = {
    equals?: (value_1: T, value_2: T) => boolean;
    delay?: number;
};

// prettier-ignore
export type Atom<T> =
    & WithAtomicValue<T>
    & WithAtomicValueOperations<T>
    & WithAtomicValueState
    & Subscribable
    & Disposable
    & { reconfigure(config: Partial<AtomConfig<T>>): void };

// prettier-ignore
export type DeferredAtom<T> =
    | (Omit<Atom<T>, 'initialized'> & { readonly initialized: true })
    | (Omit<Atom<T>, 'initialized' | 'value' | '$value' | '$$value'> & { readonly initialized: false } & WithAtomicValue<undefined>);

// =============================================================================
// Molecule
// =============================================================================

// Structural type — any atom, deferred atom, or molecule satisfies this
// prettier-ignore
export type MoleculeMember =
    & WithAtomicValue<any>
    & WithAtomicValueOperations<any>
    & WithAtomicValueState
    & Subscribable
    & Disposable;

// prettier-ignore
export type Molecule<T extends Record<string, any>> =
    & WithAtomicValue<Readonly<T>>
    & WithAtomicValueOperations<Partial<T>, Readonly<T>>
    & WithAtomicValueState
    & Subscribable
    & Disposable
    & { sync(members: Record<string, MoleculeMember>): void };

export default AtomicValue;
