import { RefCallback } from 'preact';
import { ForwardedRef } from 'preact/compat';
import { Ref } from 'preact/hooks';

// [TODO]: This should belong to a shared type module
export type List<T = any> = (List<T> | T)[];

export type TrackableRef<T = any> = Exclude<ForwardedRef<T>, null>;
export type CallbackRef<T = any> = RefCallback<T> & Ref<T> & Readonly<{ _ref: TrackableRef<T> }>;
export type CallbackRefEffect<T = any> = (current: T | null, previous: T | null) => any;
export type TrackableRefRecord<T = any> = [CallbackRef<T>, Map<CallbackRefEffect<T>, number>];
export type TrackableRefArgument<T = any> = CallbackRef<T> | TrackableRef<T>;
export type NullableTrackableRefArgument<T = any> = TrackableRefArgument<T> | null;
