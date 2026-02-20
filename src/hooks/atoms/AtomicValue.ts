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
    readonly value: T; // used value
    readonly $value: T; // latest value
};

export type WithAtomicValueOperations<T, ResetValue = T> = {
    readonly equals: (value: T) => boolean;
    readonly reset: AtomicValueReset<ResetValue>;
    readonly set: (value: T) => void;
};

export type WithAtomicValueState = {
    readonly pristine: boolean;
    readonly stale: boolean;
};

export const AtomicValue = {
    INITIAL: $initialAtomicValue,
    LAST: $lastAtomicValue,
} as const;

export default AtomicValue;
