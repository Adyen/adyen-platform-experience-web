import { enumerable } from '@src/utils/common';
import createRangeTimestampsFactory from '../factory';
import { getClampedIntegerValue, offsetForNDays, startOfDay } from '../utils';
import type { WeekDay } from '../../types';

export const DEFAULT_FIRST_WEEK_DAY = 0;

const lastWeek = (firstWeekDay: WeekDay = DEFAULT_FIRST_WEEK_DAY) => {
    const normalizedFirstWeekDay = getClampedIntegerValue(0, 6, firstWeekDay, DEFAULT_FIRST_WEEK_DAY);

    return createRangeTimestampsFactory(
        {
            from: ({ now }) => {
                const date = new Date(now);
                const dateStartTimestamp = startOfDay(date);
                date.setDate(date.getDate() - date.getDay() + normalizedFirstWeekDay);
                return date.setDate(date.getDate() - 7 * (date.getTime() > dateStartTimestamp ? 2 : 1));
            },
            offset: offsetForNDays(7),
        },
        { firstWeekDay: enumerable(normalizedFirstWeekDay) }
    )();
};

export default lastWeek;
