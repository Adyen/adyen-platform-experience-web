import createRangeTimestampsFactory from '../factory';
import { nowTimestamp, startOfDay, startOfYear } from '../utils';

const yearToDate = createRangeTimestampsFactory({
    from: ({ now }) => {
        const date = new Date(now);
        startOfDay(date);
        return startOfYear(date);
    },
    to: nowTimestamp,
});

export default yearToDate;
