import { clamp } from '../../../../../../../primitives/utils';
import createRangeTimestampsFactory from '../../factory';
import { getRangeTimestampsContextIntegerPropertyFactory, nowTimestamp, offsetsForNDays, startOfDay, startOfWeekOffset } from '../../utils';
import type { WeekDay } from '../../../types';

export const DEFAULT_FIRST_WEEK_DAY = 1;
export const ONE_WEEK_OFFSETS = offsetsForNDays(7);

const _getFirstWeekDayContext = getRangeTimestampsContextIntegerPropertyFactory<WeekDay>(0, 6, DEFAULT_FIRST_WEEK_DAY);

const offsetWeek = (weekCount: number = 0) => {
    const weeks = ~~clamp(0, weekCount as number, Infinity) || 0;

    return (firstWeekDay: WeekDay = DEFAULT_FIRST_WEEK_DAY) => {
        const restConfig = weeks ? { offsets: ONE_WEEK_OFFSETS } : { to: nowTimestamp };
        const firstWeekDayContext = _getFirstWeekDayContext(firstWeekDay);

        return createRangeTimestampsFactory(
            {
                from: ({ now, systemToTimezone, timezoneToSystem }) => {
                    const date = new Date(now);
                    const restampedDate = new Date(timezoneToSystem(now));
                    const dayDiff = (date.getDay() - restampedDate.getDay()) as -1 | 1 | 0;

                    startOfDay(date);

                    if (dayDiff) {
                        // Correction for difference between first (0) and last (6) week day
                        const dateDiff = dayDiff > 1 ? -1 : dayDiff < -1 ? 1 : dayDiff;
                        date.setDate(date.getDate() - dateDiff);
                    }

                    const dateOffset = startOfWeekOffset(firstWeekDayContext.value, date.getDay() as WeekDay) - weeks * 7;
                    date.setDate(date.getDate() + dateOffset);

                    return systemToTimezone(date);
                },
                ...restConfig,
            },
            { firstWeekDay: firstWeekDayContext.descriptor }
        )();
    };
};

export default offsetWeek;
