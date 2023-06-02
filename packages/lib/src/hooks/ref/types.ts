import { MutableRef, Ref } from 'preact/hooks';
import { MutableRefObject, RefObject } from 'preact/compat';

export type List<T> = (List<T> | T)[];
export type Reference<T> = Ref<T> | RefObject<T> | MutableRef<T> | MutableRefObject<T>;
