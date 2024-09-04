import $restamper, { RestamperWithTimezone, systemToTimezone, timezoneToSystem } from '../../../core/Localization/datetime/restamper';
import { createWatchlist, isWatchlistUnsubscribeToken } from '../../reactive/watchlist';
import { enumerable, getter, isNull, struct } from '../../../utils';
import type { Today, TodayWatchListEntries } from './types';
import { clock } from '../clock';

export const today = (() => {
    const timezones = new Map<NonNullable<RestamperWithTimezone['tz']['current']>, Today>();
    const restamper = $restamper();

    const getTimestampWithTomorrowOffset = (withTimestamp = Date.now()) => {
        const restampedDate = new Date(timezoneToSystem(restamper, withTimestamp));
        const currentTimestamp = systemToTimezone(restamper, restampedDate.setHours(0, 0, 0, 0)); // current day start timestamp
        const nextTimestamp = systemToTimezone(restamper, restampedDate.setDate(restampedDate.getDate() + 1)); // next day start timestamp
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
                let unsubscribeClock: ReturnType<Today['subscribe']> | null = null;

                const getTimestamp = () => {
                    restamper.tz = tz; // switch restamper to this timezone
                    return timestamp ?? getTimestampWithTomorrowOffset()[0];
                };

                const refreshTimestamps = (withTimestamp = Date.now()) => {
                    restamper.tz = tz; // switch restamper to this timezone
                    [timestamp, tomorrowOffset] = getTimestampWithTomorrowOffset(withTimestamp);
                };

                const { cancelSubscriptions, requestNotification, subscribe, on } = createWatchlist<TodayWatchListEntries>({
                    timestamp: getTimestamp,
                });

                on.resume = () => {
                    unsubscribeClock = clock.subscribe(snapshot => {
                        if (isWatchlistUnsubscribeToken(snapshot)) return;

                        const { now } = snapshot;

                        if (isNull(timestamp) || isNull(tomorrowOffset)) return refreshTimestamps(now);
                        if (now - timestamp < tomorrowOffset) return;

                        refreshTimestamps(now);
                        requestNotification();
                    });
                };

                on.idle = () => {
                    unsubscribeClock?.();
                    timestamp = tomorrowOffset = unsubscribeClock = null;
                };

                const instance = struct<Today>({
                    cancelSubscriptions: enumerable(cancelSubscriptions),
                    timestamp: getter(getTimestamp),
                    timezone: enumerable(tz),
                    subscribe: enumerable(subscribe),
                });

                timezones.set(tz, instance);
                return instance;
            })()
        );
    };
})();

export default today;
