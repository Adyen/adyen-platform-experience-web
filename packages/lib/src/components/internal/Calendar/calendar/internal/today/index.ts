import $watchable from '../../shared/watchable';
import { struct } from '../../shared/utils';
import { Today } from '../../types';

const today = (() => {
    let timestamp: number;
    let tomorrowOffset: number;
    let controller: AbortController;

    const getTimestamp = () => new Date().setHours(0, 0, 0, 0);

    const refreshTimestamp = () => {
        timestamp = getTimestamp();
        const date = new Date(timestamp);
        tomorrowOffset = date.setDate(date.getDate() + 1) - timestamp;
    };

    const animationInterval = (ms: number, signal: AbortSignal, callback: () => any) => {
        const start = document.timeline.currentTime ?? performance.now();

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
        if (Date.now() - timestamp < tomorrowOffset) return;
        refreshTimestamp();
        watchable.notify();
    };

    const watchable = $watchable();

    watchable.callback.resume = () => {
        controller = new AbortController();
        refreshTimestamp();
        animationInterval(1000, controller.signal, animationIntervalCallback);
    };

    watchable.callback.idle = () => {
        controller.abort();
    };

    return struct({
        timestamp: { get: () => (watchable.idle ? getTimestamp() : timestamp) },
        watch: { value: watchable.watch },
    }) as Today;
})();

export default today;
