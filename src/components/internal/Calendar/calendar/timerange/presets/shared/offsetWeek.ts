import { clamp } from '../../../../../../../utils';
import createRangeTimestampsFactory from '../../factory';
import { getRangeTimestampsContextIntegerPropertyFactory, nowTimestamp, offsetsForNDays } from '../../utils';
import { startOfWeek } from '../../../utils';
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
                from: ({ now, timezone, systemToTimezone, timezoneToSystem }) => {
                    const date = new Date(timezoneToSystem(startOfWeek(now, timezone, firstWeekDayContext.value)));
                    date.setDate(date.getDate() - weeks * 7);
                    return systemToTimezone(date);
                },
                ...restConfig,
            },
            { firstWeekDay: firstWeekDayContext.descriptor }
        )();
    };
};

export default offsetWeek;
