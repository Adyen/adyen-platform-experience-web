import { RefCallback } from 'preact';
import { ForwardedRef } from 'preact/compat';
import { Ref } from 'preact/hooks';

export type Reflex<T = any> = RefCallback<T> & Ref<T> & Readonly<{ _ref: ReflexableRef<T> }>;
export type Reflexable<T = any> = Reflex<T> | ReflexableRef<T>;
export type ReflexableRecord<T = any> = [Reflex<T>, Map<ReflexAction<T>, number>];
export type ReflexableRef<T = any> = Exclude<ForwardedRef<T>, null>;
export type ReflexAction<T = any> = (current: T | null, previous: T | null) => any;
export type NullableReflexable<T = any> = Reflexable<T> | null;
