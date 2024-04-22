export interface Abortable<T> {
    readonly abort: () => void;
    get promise(): Promise<never>;
    readonly reason: T | undefined;
    get signal(): AbortSignal;
}
