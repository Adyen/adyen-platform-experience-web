import createTimeRange from '../createTimeRange';
import { startOfDay, startOfMonth } from '../utils';

const thisMonth = createTimeRange({
    get from() {
        const date = new Date(this.to);
        startOfDay(date);
        return startOfMonth(date);
    },
    get to() {
        return Date.now();
    },
});

export default thisMonth;
