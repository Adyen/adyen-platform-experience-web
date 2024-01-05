import createRangeTimestampsFactory from '../factory';
import { nowTimestamp, startOfYear } from '../utils';

const yearToDate = createRangeTimestampsFactory({
    from: ({ now }) => startOfYear(new Date(now)),
    to: nowTimestamp,
});

export default yearToDate;
