import { UNWATCH_SIGNAL } from './constants';

export type WatchCallable<T, ThisType = any> = (this: ThisType, ...args: any[]) => T;

export type WatchCallback<T extends Record<string, any>> = {
    (snapshot: T): any;
    (signal: typeof UNWATCH_SIGNAL): any;
};

export type WatchAtoms<T extends Record<string, any>> = {
    [K in keyof T]: WatchCallable<T[K]> | T[K];
};

export type Watchable<T extends Record<string, any>> = {
    readonly callback: {
        get idle(): WatchCallable<any>;
        set idle(callback: WatchCallable<any> | undefined);
        get resume(): WatchCallable<any>;
        set resume(callback: WatchCallable<any> | undefined);
    };
    readonly idle: boolean;
    readonly notify: WatchCallable<boolean | undefined>;
    readonly snapshot: T;
    readonly watch: (callback?: WatchCallback<T>) => WatchCallable<void>;
};
