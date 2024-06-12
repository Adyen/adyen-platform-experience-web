import { boolOrFalse, clamp, enumerable, struct } from '../../../utils';
import { DEFAULT_INTERVAL_MS, MAX_INTERVAL_MS } from './constants';
import type { Interval } from './types';

/**
 * Starts an abortable interval with autocorrection for time drifts.
 *
 * @example
 * // Schedule a callback every second:
 * let interval = createInterval(time => {
 *   console.log('clock!', time);
 * }, 1000, true);
 *
 * // And to stop it:
 * interval.cancel();
 *
 * // Don't forget to clean up:
 * interval = null;
 *
 * @param callback - Callback to be executed at every of the specified fixed time interval. This callback will be
 *     called with a {@link DOMHighResTimeStamp `DOMHighResTimeStamp`}.
 *
 * @param ms - The desired fixed time interval (in milliseconds). The specified value will be clamped. This parameter
 *     is optional, and defaults to {@link DEFAULT_INTERVAL_MS `DEFAULT_INTERVAL_MS`} if omitted.
 *
 * @param runCallbackAsap - Whether to execute callback as soon as possible. This parameter is optional, and takes a
 *     `boolean` value, where `true` means the `callback` will be triggered immediately when the interval is created.
 *     This parameter defaults to `false` if omitted.
 *
 * @see [Gist by Jake Archibald](https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95)
 */
export const createInterval = (callback: (time: DOMHighResTimeStamp) => any, ms = DEFAULT_INTERVAL_MS, runCallbackAsap = false) => {
    let _abortController: AbortController | undefined = new AbortController();
    let _intervalDelay = clamp(0, ~~ms, MAX_INTERVAL_MS);
    let _shouldRunCallbackAsap = boolOrFalse(runCallbackAsap);

    if (!Number.isFinite(_intervalDelay)) {
        _intervalDelay = DEFAULT_INTERVAL_MS;
    }

    // Prefer `currentTime`, as it'll better sync animations queued in the same frame,
    // but if it isn't supported, `performance.now()` is fine.
    const _startTime = (document.timeline?.currentTime as number) ?? performance.now();

    const _cancel = () => {
        // Release the abort controller resource once aborted
        _abortController?.abort();
        _abortController = undefined;
    };

    const _frame = (time: number) => {
        if (!_abortController || _abortController.signal.aborted) return;
        _scheduleFrame(time);
        callback(time);
    };

    const _scheduleFrame = (time: number) => {
        // Just in case the interval callback needs to be executed as soon as possible,
        // start with a zero delay (instead of the adjusted `ms` delay)
        let delay = 0;

        if (!_shouldRunCallbackAsap) {
            const elapsed = time - _startTime;
            const roundedElapsed = Math.round(elapsed / _intervalDelay) * _intervalDelay;
            const targetNext = _startTime + roundedElapsed + _intervalDelay;

            // Callback should be executed after adjusted `ms` delay
            delay = targetNext - performance.now();
        }

        setTimeout(() => requestAnimationFrame(_frame), delay);
    };

    _scheduleFrame(_startTime);

    // A frame must have already been scheduled for immediate run
    _shouldRunCallbackAsap = false;

    return struct<Interval>({
        cancel: enumerable(_cancel),
        delay: enumerable(ms),
        signal: enumerable(_abortController.signal),
    });
};

export default createInterval;
