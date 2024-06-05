export interface AbortSink {
    readonly abort: () => void;
    readonly disconnect: () => void;
    readonly signal: AbortSignal;
    readonly unlink: (...sourceSignals: (AbortSignal | undefined)[]) => void;
}
