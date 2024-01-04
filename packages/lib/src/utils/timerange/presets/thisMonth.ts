import createRangeTimestampsFactory from '../factory';
import { nowTimestamp, startOfDay, startOfMonth } from '../utils';

const thisMonth = createRangeTimestampsFactory({
    from: ({ now }) => {
        const date = new Date(now);
        startOfDay(date);
        return startOfMonth(date);
    },
    to: nowTimestamp,
});

export default thisMonth;
