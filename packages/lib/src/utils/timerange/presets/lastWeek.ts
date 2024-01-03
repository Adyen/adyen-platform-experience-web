import createTimeRange from '../createTimeRange';
import { startOfDay } from '../utils';

const lastWeek = (firstWeekDay: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0) =>
    createTimeRange({
        get from() {
            const date = new Date();
            startOfDay(date);
            return date.setDate(date.getDate() - date.getDay() + firstWeekDay - 7);
        },
        offset: Object.freeze([0, 0, 7, 23, 59, 59, 999]),
    });

export default lastWeek;
