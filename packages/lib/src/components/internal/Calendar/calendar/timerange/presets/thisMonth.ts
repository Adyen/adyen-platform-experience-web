import createRangeTimestampsFactory from '../factory';
import { nowTimestamp, startOfMonth } from '../utils';

const thisMonth = createRangeTimestampsFactory({
    from: ({ now }) => startOfMonth(new Date(now)),
    to: nowTimestamp,
});

export default thisMonth;
