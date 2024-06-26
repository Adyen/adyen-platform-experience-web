export interface Abortable<T> {
    readonly abort: () => void;
    get promise(): Promise<never>;
    readonly reason: T | undefined;
    readonly refresh: () => Abortable<T>;
    get signal(): AbortSignal;
}
