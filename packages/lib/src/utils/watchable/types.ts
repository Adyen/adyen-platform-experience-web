import { UNWATCH_SIGNAL } from './constants';

export type WatchCallable<T, ThisType = any> = (this: ThisType, ...args: any[]) => T;

export type WatchCallback<T extends Record<string, any>> = {
    (snapshot: T): any;
    (signal: typeof UNWATCH_SIGNAL): any;
};

export type WatchAtoms<T extends Record<string, any>> = {
    [K in keyof T]: WatchCallable<T[K]> | T[K];
};

export type Watchable<T extends Record<string, any>> = Readonly<{
    callback: {
        get idle(): WatchCallable<any>;
        set idle(callback: WatchCallable<any> | undefined);
        get resume(): WatchCallable<any>;
        set resume(callback: WatchCallable<any> | undefined);
    };
    idle: boolean;
    notify: WatchCallable<boolean | undefined>;
    snapshot: T;
    watch: (callback?: WatchCallback<T>) => WatchCallable<void>;
}>;

export type WatchableFactory = {
    <T extends Record<string, any>>(watchableAtoms?: WatchAtoms<T>): Watchable<T>;
    readonly UNWATCH: typeof UNWATCH_SIGNAL;
    readonly withSyncEffect: (effect?: WatchCallable<any>) => <T extends WatchCallable<any> = WatchCallable<any>>(fn: T) => T;
};
