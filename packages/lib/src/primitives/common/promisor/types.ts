export interface Promisor<T> {
    get promise(): Promise<T>;
    readonly refresh: () => void;
    get resolve(): (value: T | PromiseLike<T>) => void;
}
