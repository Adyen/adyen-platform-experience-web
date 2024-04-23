import { UNSUBSCRIBE_TOKEN } from './constants';

export type WatchListCallable<ReturnType = any, ThisType = any> = (this: ThisType, ...args: any[]) => ReturnType;

export interface WatchList<T extends Record<string, any>> {
    readonly cancelSubscriptions: () => true | undefined;
    get idle(): boolean;
    readonly on: WatchListSubscriptionEventCallbacks;
    readonly requestNotification: () => boolean | undefined;
    get snapshot(): Readonly<T>;
    readonly subscribe: (subscriptionCallback?: WatchListSubscriptionCallback<T>) => () => void;
}

export type WatchListEntries<T extends Record<string, any>> = {
    [K in keyof T]: WatchListCallable<T[K], T> | T[K];
};

export interface WatchListSubscriptionCallback<T extends Record<string, any>> {
    (currentStateSnapshot: Readonly<T>): any;
    (unsubscribeToken: typeof UNSUBSCRIBE_TOKEN): any;
}

export interface WatchListSubscriptionEventCallbacks {
    get idle(): WatchListCallable;
    set idle(callback: WatchListCallable | undefined | null);
    get resume(): WatchListCallable;
    set resume(callback: WatchListCallable | undefined | null);
}
