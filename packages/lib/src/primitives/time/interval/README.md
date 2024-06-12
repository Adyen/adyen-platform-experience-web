# createInterval

The `setInterval()` global function available in most JS runtime and scripting environments provides the primary mechanism for executing a callback at fixed time intervals. However, it has some known drawbacks associated with its performance and scheduling of callback invocation tasks. Also, there is the issue of time drifting which becomes more prominent for long-running intervals and is usually undesired in situations where high precision is of importance.

For these reasons, the `createInterval()` function becomes a viable alternative for scheduling callbacks to be executed at approximately fixed time intervals — with better performance (since it uses `requestAnimationFrame`) and auto-correction for time drift.

> Its implementation is based on this [gist by Jake Archibald][#1].

## Definitions

### Functions

```ts
createInterval(
    /**
     * @param callback — Callback to be executed at every of the specified
     *                   fixed time interval. This callback will be called
     *                   with a DOM high resolution timestamp.
     */
    callback: (time: DOMHighResTimeStamp) => any,

    /**
     * @param ms — The desired fixed time interval (in milliseconds).
     *             The specified value will be clamped. This parameter is
     *             optional, and defaults to `1000` if omitted.
     */
    ms?: number,

    /**
     * @param runCallbackAsap — Whether to execute callback as soon as
     *                          possible. This parameter is optional, and
     *                          takes a `boolean` value — where `true` means
     *                          the `callback` will be triggered immediately
     *                          when the interval is created. This parameter
     *                          defaults to `false` if omitted.
     */
    runCallbackAsap?: boolean
): Interval;
```

### Interfaces

```ts
interface Interval {
    /**
     * Should be called to cancel the interval.
     */
    cancel: () => void;

    /**
     * The effective delay used for the interval (in milliseconds).
     * The callback associated with the interval will be triggered
     * approximately every `Interval.delay` milliseconds until the
     * interval is cancelled.
     */
    delay: number;

    /**
     * The `AbortSignal` associated with the interval for cancellation
     * observability. The `aborted` property of `Interval.signal` should
     * be `true` if the interval has been cancelled, and `false` otherwise.
     */
    signal: AbortSignal;
}
```

## Creating an interval

```ts
import { createInterval } from '@src/primitives/time/interval';

// Schedule a callback every second:
let interval = createInterval(
    time => {
        console.log('clock!', time);
    },
    1000,
    true
);

// And to stop it:
interval.cancel();

// Don't forget to clean up later:
interval = null;
```

## Detecting interval cancellation

An interval remains active after it has been created; until it gets cancelled — i.e. when its `cancel()` function is first called. The associated `signal` (which is an instance of `AbortSignal`) of the interval can be utilized for cancellation detection purposes.

-   **Status detection**  
    To detect at any time whether the interval has been cancelled, query the `aborted` property of its associated `signal`.

```ts
const isIntervalCancelled = interval.signal.aborted;
```

-   **Instant detection**  
    To detect the very instant when the interval is cancelled (i.e. when its `cancel()` function is called) and possibly react to its cancellation, attach an `"abort"` event listener to its associated `signal`.

```ts
interval.signal.addEventListener('abort', function _listener() {
    // remove this event listener (will no longer be needed)
    this.removeEventListener('abort', _listener);

    // interval has been cancelled
    // do something here...
});
```

[#1]: https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95
