import { clamp } from '@src/utils/common';
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
                from: ({ now, system2Timezone, timezone2System, timezoneOffset }) => {
                    const date = new Date(now);

                    if (timezoneOffset(startOfDay(date))) {
                        const restampedDate = new Date(timezone2System(now));
                        let dayDiff = (date.getDay() - restampedDate.getDay()) as -1 | 1 | 0;

                        if (dayDiff) {
                            // Correction for difference between first (0) and last (6) week day
                            dayDiff = dayDiff > 1 ? -1 : dayDiff < -1 ? 1 : dayDiff;
                        }

                        date.setDate(date.getDate() - dayDiff);
                    }

                    const dateOffset = startOfWeekOffset(firstWeekDayContext.value, date.getDay() as WeekDay) - weeks * 7;
                    return system2Timezone(date.setDate(date.getDate() + dateOffset));
                },
                ...restConfig,
            },
            { firstWeekDay: firstWeekDayContext.descriptor }
        )();
    };
};

export default offsetWeek;
