import createTimeRange from '../createTimeRange';
import { startOfDay, startOfYear } from '../utils';

const yearToDate = createTimeRange({
    get from() {
        const date = new Date(this.to);
        startOfDay(date);
        return startOfYear(date);
    },
    get to() {
        return Date.now();
    },
});

export default yearToDate;
