export interface Promisor<T, Params extends any[] = []> {
    (this: any, ...args: Params): Promise<T>;
    readonly abort: () => void;
    get promise(): Promise<T>;
    readonly refresh: () => void;
}
