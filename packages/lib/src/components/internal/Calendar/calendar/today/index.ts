import $restamper, { RestamperWithTimezone, systemToTimezone, timezoneToSystem } from '@src/core/Localization/datetime/restamper';
import $watchable from '@src/utils/watchable';
import { struct } from '@src/utils/common';
import { Today } from '../types';

const today = (() => {
    let timestamp: number;
    let tomorrowOffset: number;
    let controller: AbortController;

    const getTimestamp = () => {
        const date = new Date();
        const restampedDate = new Date(timezoneToSystem(restamper, date));
        const dateDiff = (date.getDate() - restampedDate.getDate()) as -1 | 1 | 0;

        if (dateDiff) {
            // Correction for difference between first (1) and last (28, 29, 30, 31) day of month
            const dateOffset = dateDiff > 1 ? -1 : dateDiff < -1 ? 1 : dateDiff;
            date.setDate(date.getDate() - dateOffset);
        }

        return systemToTimezone(restamper, date.setHours(0, 0, 0, 0));
    };

    const getTimezone = () => restamper.tz.current;

    const refreshTimestamp = () => {
        timestamp = getTimestamp();
        const systemDate = new Date(timezoneToSystem(restamper, timestamp));
        tomorrowOffset = systemToTimezone(restamper, systemDate.setDate(systemDate.getDate() + 1)) - timestamp;
    };

    // Adopted from: https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95
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

    const restamper = $restamper();

    const watchable = $watchable({
        timestamp: getTimestamp,
        timezone: getTimezone,
    });

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
        timezone: {
            get: getTimezone,
            set: (timezone?: RestamperWithTimezone['tz']['current'] | null) => {
                const tz = restamper.tz;
                const currentTimezone = tz.current;
                restamper.tz = timezone;

                if (tz.current !== currentTimezone) {
                    refreshTimestamp();
                    watchable.notify();
                }
            },
        },
        watch: { value: watchable.watch },
    }) as Today;
})();

export default today;
