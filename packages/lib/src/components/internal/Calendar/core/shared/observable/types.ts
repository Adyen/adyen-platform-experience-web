import { OBSERVABLE_DISCONNECT_SIGNAL } from './constants';

export type ObservableCallable<ReturnType> = (...args: any[]) => ReturnType;

export type ObservableCallback<T extends Record<string, any>> = {
    (snapshot: T): any;
    (signal: typeof OBSERVABLE_DISCONNECT_SIGNAL): any;
};

export type ObservableAtoms<T extends Record<string, any>> = {
    [K in keyof T]: ObservableCallable<T[K]> | T[K];
};

export type Observable<T extends Record<string, any>> = {
    readonly callback: {
        get idle(): ObservableCallable<any>;
        set idle(callback: ObservableCallable<any> | undefined);
        get resume(): ObservableCallable<any>;
        set resume(callback: ObservableCallable<any> | undefined);
    };
    readonly idle: boolean;
    readonly notify: ObservableCallable<boolean | undefined>;
    readonly observe: (callback?: ObservableCallback<T>) => ObservableCallable<void>;
    readonly snapshot: T;
};
