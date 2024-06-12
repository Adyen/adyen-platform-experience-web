export interface Interval {
    /**
     * Should be called to cancel the interval.
     */
    readonly cancel: () => void;

    /**
     * The effective delay used for the interval (in milliseconds). The callback associated with the interval will be
     * triggered approximately every `Interval.delay` milliseconds until the interval is cancelled.
     */
    readonly delay: number;

    /**
     * The {@link AbortSignal `AbortSignal`} associated with the interval for cancellation observability. The `aborted`
     * property of `Interval.signal` should be `true` if the interval has been cancelled, and `false` otherwise.
     */
    readonly signal: AbortSignal;
}
