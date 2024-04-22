export interface ErrorContainer<T = unknown> {
    get error(): T | undefined;
    get hasError(): boolean;
    readonly reset: () => void;
    readonly set: (err: T) => void;
}
