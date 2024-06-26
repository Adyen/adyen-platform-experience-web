export interface Interval {
    readonly cancel: () => void;
    readonly delay: number;
    readonly signal: AbortSignal;
}
