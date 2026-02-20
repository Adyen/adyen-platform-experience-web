import type { ValueOfRecord } from '../../../utils/types';
import { AtomicValue } from './constants';

export interface WithValue<T> {
    readonly value: T; // used value
    readonly $value: T; // latest value
}

export type AtomicValue = ValueOfRecord<typeof AtomicValue>;

export interface AtomicReset<T> {
    (value: T | AtomicValue): void;
    (): void;
}

export interface AtomResult<T> extends WithValue<T> {
    readonly equals: (value: T) => boolean;
    readonly reset: AtomicReset<T>;
    readonly set: (value: T) => void;
    readonly pristine: boolean;
    readonly stale: boolean;
}

export interface MoleculeResult<T extends Record<string, any>> extends AtomResult<Readonly<T>> {
    readonly equals: (value: Partial<T>) => boolean;
    readonly set: (value: Partial<T>) => void;
}

export type AtomicMembers<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends MoleculeResult<T[K]> ? MoleculeResult<T[K]> : AtomResult<T[K]>;
};
