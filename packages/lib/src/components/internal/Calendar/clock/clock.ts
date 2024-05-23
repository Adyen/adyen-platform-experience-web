import $watchable from '../../../../utils/watchable';
import { struct } from '../../../../utils/common';
import { Clock } from './types';

const clock = (() => {
    let timestamp: number | null = null;
    let controller: AbortController;

    // Adopted from: https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95
    const animationInterval = (ms: number, signal: AbortSignal, callback: () => any) => {
        const start = (document.timeline.currentTime as number) ?? performance.now();

        const scheduleFrame = (time: number) => {
            const elapsed = time - start;
            const roundedElapsed = Math.round(elapsed / ms) * ms;
            const targetNext = start + roundedElapsed + ms;
            const delay = targetNext - performance.now();
            setTimeout(() => requestAnimationFrame(frame), delay);
        };

        const frame = (time: number) => {
            if (signal.aborted) return;
            scheduleFrame(time);
            callback();
        };

        scheduleFrame(start);
    };

    const animationIntervalCallback = () => {
        timestamp = Date.now();
        watchable.notify();
    };

    const getTimestamp = () => timestamp ?? Date.now();
    const watchable = $watchable({ timestamp: getTimestamp });

    watchable.callback.resume = () => {
        controller = new AbortController();
        timestamp = Date.now();
        animationInterval(1000, controller.signal, animationIntervalCallback);
    };

    watchable.callback.idle = () => {
        controller.abort();
        timestamp = null;
    };

    return struct({
        timestamp: { get: getTimestamp },
        watch: { value: watchable.watch },
    }) as Clock;
})();

export default clock;
