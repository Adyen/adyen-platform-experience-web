export interface Promisor<T extends any, Params extends any[] = []> {
    (this: any, ...args: Params): Promise<T>;
    readonly abort: () => void;
    get promise(): Promise<T>;
    readonly refresh: () => void;
    get signal(): AbortSignal | undefined;
    set signal(signal: AbortSignal | undefined | null);
}
