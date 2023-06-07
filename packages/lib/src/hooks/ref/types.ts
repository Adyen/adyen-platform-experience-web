import { RefCallback, RefObject } from 'preact';
import { MutableRefObject } from 'preact/compat';
import { MutableRef, Ref } from 'preact/hooks';

export type NamedRef<T = any> = RefCallback<T> & Readonly<RefObject<T>>;
export type NamedRefCallback<T> = (current: T | null, previous: T | null) => any;
export type NamedRefEffect = (...args: any[]) => any;
export type NamedRefRecord<T = any> = [NamedRef<T> | null, Set<NamedRefEffect>, Map<NamedRefCallback<T>, number>];

export type List<T> = (List<T> | T)[];
export type Reference<T> = Ref<T> | RefObject<T> | MutableRef<T> | MutableRefObject<T>;
