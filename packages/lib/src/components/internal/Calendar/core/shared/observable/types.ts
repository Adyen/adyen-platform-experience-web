export type ObservableCallable<ReturnType> = (...args: any[]) => ReturnType;
export type ObservableCallback = ObservableCallable<any>;

export type Observable = {
    readonly callback: {
        get idle(): ObservableCallback;
        set idle(callback: ObservableCallback | undefined);
        get resume(): ObservableCallback;
        set resume(callback: ObservableCallback | undefined);
    };
    readonly idle: boolean;
    readonly notify: ObservableCallable<boolean>;
    readonly observe: (callback?: ObservableCallback) => ObservableCallable<void>;
};
