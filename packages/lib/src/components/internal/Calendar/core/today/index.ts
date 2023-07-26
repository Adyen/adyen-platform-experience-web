import { struct } from '../shared/utils';
import { Today, TodayWatchCallback } from './types';

const today = (() => {
    let controller: AbortController;
    let timestamp: number;
    let tomorrowOffset: number;
    let running = false;

    const observers = new Set<TodayWatchCallback>();

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
        observers.forEach(cb => cb(timestamp));
    };

    const startInterval = () => {
        if (!running && (running = true)) {
            controller = new AbortController();
            refreshTimestamp();
            animationInterval(1000, controller.signal, animationIntervalCallback);
        }
    };

    const stopInterval = () => {
        if (observers.size === 0) {
            controller.abort();
            running = false;
        }
    };

    const observe = (callback: TodayWatchCallback) => {
        if (!callback) return () => {};

        observers.add(callback);
        startInterval();
        return () => {
            observers.delete(callback) && stopInterval();
        };
    };

    return struct({
        timestamp: { get: () => (running ? timestamp : getTimestamp()) },
        watch: { value: observe },
    }) as Today;
})();

export default today;
