import { enumerable } from '@src/utils/common';
import createRangeTimestampsFactory from '../factory';
import { startOfDay } from '../utils';

const lastWeek = (firstWeekDay: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0) =>
    createRangeTimestampsFactory(
        {
            from: ({ now }) => {
                const date = new Date(now);
                startOfDay(date);
                return date.setDate(date.getDate() - date.getDay() + firstWeekDay - 7);
            },
            offset: Object.freeze([0, 0, 6, 23, 59, 59, 999]),
        },
        { firstWeekDay: enumerable(firstWeekDay) }
    )();

export default lastWeek;
