import { clamp } from '@src/utils/common';
import createRangeTimestampsFactory from '../../factory';
import { getRangeTimestampsContextIntegerPropertyFactory, nowTimestamp, offsetForNDays, startOfDay } from '../../utils';
import type { WeekDay } from '../../../types';

export const DEFAULT_FIRST_WEEK_DAY = 1;

const _getFirstWeekDayContext = getRangeTimestampsContextIntegerPropertyFactory<WeekDay>(0, 6, DEFAULT_FIRST_WEEK_DAY);

const weekAgo = (weekCount: number = 0) => {
    const weeks = ~~clamp(0, weekCount as number, Infinity) || 0;

    return (firstWeekDay: WeekDay = DEFAULT_FIRST_WEEK_DAY) => {
        const restConfig = weeks ? { offset: offsetForNDays(7 * weeks) } : { to: nowTimestamp };

        const firstWeekDayContext = _getFirstWeekDayContext(firstWeekDay);

        return createRangeTimestampsFactory(
            {
                from: ({ now }) => {
                    const date = new Date(now);
                    const dateStartTimestamp = startOfDay(date);
                    date.setDate(date.getDate() - date.getDay() + firstWeekDayContext.value);
                    return date.setDate(date.getDate() - 7 * ((date.getTime() > dateStartTimestamp ? 1 : 0) + weeks));
                },
                ...restConfig,
            },
            { firstWeekDay: firstWeekDayContext.descriptor }
        )();
    };
};

export default weekAgo;
