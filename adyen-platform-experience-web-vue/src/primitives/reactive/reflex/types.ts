import type { Nullable } from '../../../utils/types';
import { REF } from './constants';

export type RefAsCallback<T = any> = (instance: T | null) => any;
export type RefAsObject<T = any> = { current: T | null };
export type Ref<T = any> = RefAsCallback<T> | RefAsObject<T> | null;

export interface Reflex<T = any> {
    (instance?: T | null): any;
    current: T | null;
    readonly [REF]: RefAsObject<T>;
    readonly actions: Readonly<Pick<ReflexRecord<T>[1], 'get' | 'size'>>;
}

export type Reflexable<T = any> = Ref<T> | Reflex<T>;
export type ReflexAction<T = any> = (current: Nullable<T>, previous: Nullable<T>) => any;

export interface ReflexContainer<T = any> {
    get action(): ReflexAction<T>;
    get reflex(): Nullable<Reflex<T>>;
    readonly release: () => void;
    readonly update: (action: ReflexAction<T>, reflexable?: Nullable<Reflexable<T>>) => void;
}

export type ReflexRecord<T = any> = [Reflex<T>, Map<ReflexAction<T>, number>];

export interface ReflexRegister {
    bind: <T = any>(reflexable: Reflexable<T>, action?: ReflexAction<T>) => ReflexRecord<T>[0];
    unbind: <T = any>(reflexable: Reflexable<T>, action: ReflexAction<T>) => void;
}
