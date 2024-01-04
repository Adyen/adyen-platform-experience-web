import createRangeTimestampsFactory from '../factory';
import { startOfDay, startOfMonth } from '../utils';

const lastMonth = createRangeTimestampsFactory({
    from(context) {
        const date = new Date(this.to(context));
        startOfDay(date);
        return startOfMonth(date);
    },
    to: ({ now }) => {
        const date = new Date(now);
        startOfDay(date);
        return startOfMonth(date) - 1;
    },
});

export default lastMonth;
