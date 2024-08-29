export interface Interval {
    (signal?: AbortSignal): AsyncGenerator<DOMHighResTimeStamp, void, unknown>;
    readonly cancel: () => void;
    readonly delay: number;
    readonly signal: AbortSignal;
}
