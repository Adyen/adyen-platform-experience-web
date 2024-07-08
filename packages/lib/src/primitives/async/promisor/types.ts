export interface Promisor<T extends any, Params extends any[] = []> {
    (this: any, signal?: AbortSignal | null, ...args: Params): Promise<T>;
    readonly abort: () => void;
    get promise(): Promise<T>;
    readonly refresh: () => void;
}
