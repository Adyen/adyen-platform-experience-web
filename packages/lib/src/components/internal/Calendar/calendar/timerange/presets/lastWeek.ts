import createRangeTimestampsFactory from '../factory';
import { getRangeTimestampsContextIntegerPropertyFactory, offsetForNDays, startOfDay } from '../utils';
import type { WeekDay } from '../../types';

export const DEFAULT_FIRST_WEEK_DAY = 0;

const _getFirstWeekDayContext = getRangeTimestampsContextIntegerPropertyFactory<WeekDay>(0, 6, DEFAULT_FIRST_WEEK_DAY);

const lastWeek = (firstWeekDay: WeekDay = DEFAULT_FIRST_WEEK_DAY) => {
    const firstWeekDayContext = _getFirstWeekDayContext(firstWeekDay);

    return createRangeTimestampsFactory(
        {
            from: ({ now }) => {
                const date = new Date(now);
                const dateStartTimestamp = startOfDay(date);
                date.setDate(date.getDate() - date.getDay() + firstWeekDayContext.value);
                return date.setDate(date.getDate() - 7 * (date.getTime() > dateStartTimestamp ? 2 : 1));
            },
            offset: offsetForNDays(7),
        },
        { firstWeekDay: firstWeekDayContext.descriptor }
    )();
};

export default lastWeek;
