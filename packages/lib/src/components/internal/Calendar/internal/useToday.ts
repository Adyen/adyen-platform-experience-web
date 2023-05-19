import { useEffect, useState } from 'preact/hooks';
import { getCalendarDateString } from './createCalendar';

const timeSecondInterval = (() => {
    let controller: AbortController;
    let running = false;

    const OBSERVER_CALLBACKS = new Set<() => any>();

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

    const startInterval = () => {
        if (!running && (running = true)) {
            controller = new AbortController();
            animationInterval(1000, controller.signal, () => {
                OBSERVER_CALLBACKS.forEach(cb => cb());
            });
        }
    };

    const stopInterval = () => {
        if (OBSERVER_CALLBACKS.size === 0) {
            controller.abort();
            running = false;
        }
    };

    return function observer(callback?: () => any) {
        if (!callback) return () => {};

        OBSERVER_CALLBACKS.add(callback);
        startInterval();
        return () => { OBSERVER_CALLBACKS.delete(callback) && stopInterval() };
    };
})();

const useToday = (watch = false) => {
    const [ today, setToday ] = useState(getCalendarDateString(new Date()));

    useEffect(() => {
        if (watch) {
            let disconnectTimeObserver: (() => void) | null = timeSecondInterval(() => {
                setToday(getCalendarDateString(new Date()));
            });

            return () => {
                disconnectTimeObserver?.();
                disconnectTimeObserver = null;
            };
        }
    }, [watch]);

    return today;
};

export default useToday;
