import createTimeRange from '../createTimeRange';
import { startOfDay, startOfMonth } from '../utils';

const lastMonth = createTimeRange({
    get from() {
        const date = new Date(this.to);
        startOfDay(date);
        return startOfMonth(date);
    },
    get to() {
        const date = new Date();
        startOfDay(date);
        return startOfMonth(date) - 1;
    },
});

export default lastMonth;
