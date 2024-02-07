import $restamper, { RestamperWithTimezone, systemToTimezone, timezoneToSystem } from '@src/core/Localization/datetime/restamper';
import $watchable from '@src/utils/watchable';
import { struct } from '@src/utils/common';
import { Today } from './types';
import clock from './clock';

const today = (() => {
    const timezones = new Map<NonNullable<RestamperWithTimezone['tz']['current']>, Today>();
    const restamper = $restamper();

    const getTimestampWithTomorrowOffset = (withTimestamp = clock.timestamp) => {
        const date = new Date(withTimestamp);
        const restampedDate = new Date(timezoneToSystem(restamper, withTimestamp));
        const dateDiff = (date.getDate() - restampedDate.getDate()) as -1 | 1 | 0;

        if (dateDiff) {
            // Correction for difference between first (1) and last (28, 29, 30, 31) day of month
            const dateOffset = dateDiff > 1 ? -1 : dateDiff < -1 ? 1 : dateDiff;
            date.setDate(date.getDate() - dateOffset);
        }

        const currentTimestamp = systemToTimezone(restamper, date.setHours(0, 0, 0, 0)); // current day start timestamp
        const nextTimestamp = systemToTimezone(restamper, date.setDate(date.getDate() + 1)); // next day start timestamp
        return [currentTimestamp, nextTimestamp - currentTimestamp] as const;
    };

    return (timezone?: RestamperWithTimezone['tz']['current']) => {
        restamper.tz = timezone;

        const tz = restamper.tz.current!;

        return (
            timezones.get(tz) ??
            (() => {
                let timestamp: number | null = null;
                let tomorrowOffset: number | null = null;
                let unwatch: ReturnType<Today['watch']> | null = null;

                const getTimestamp = () => {
                    restamper.tz = tz; // switch restamper to this timezone
                    return timestamp ?? getTimestampWithTomorrowOffset()[0];
                };

                const refreshTimestamps = (withTimestamp = clock.timestamp) => {
                    restamper.tz = tz; // switch restamper to this timezone
                    [timestamp, tomorrowOffset] = getTimestampWithTomorrowOffset(withTimestamp);
                };

                const watchable = $watchable({ timestamp: getTimestamp });

                watchable.callback.resume = () => {
                    unwatch = clock.watch(snapshotOrSignal => {
                        if (snapshotOrSignal === $watchable.UNWATCH) return;
                        if (timestamp === null || tomorrowOffset === null) return refreshTimestamps();
                        if (clock.timestamp - timestamp < tomorrowOffset) return;

                        refreshTimestamps();
                        watchable.notify();
                    });
                };

                watchable.callback.idle = () => {
                    unwatch?.();
                    timestamp = tomorrowOffset = unwatch = null;
                };

                const instance = struct({
                    timestamp: { get: getTimestamp },
                    timezone: { value: tz },
                    watch: { value: watchable.watch },
                }) as Today;

                timezones.set(tz, instance);
                return instance;
            })()
        );
    };
})();

export default today;
