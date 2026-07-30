export interface Abortable<T> {
    readonly abort: () => void;
    get promise(): Promise<never>;
    readonly reason: T | undefined;
    readonly refresh: (abort?: boolean) => Abortable<T>;
    get signal(): AbortSignal;
}
