export interface BaseEmitter<T> extends AsyncIterable<T> {
    (callback: (value: T) => unknown, signal?: AbortSignal): void;
}

export interface Emitter<T> extends BaseEmitter<T> {
    readonly end: () => void;
    readonly signal: AbortSignal;
}
