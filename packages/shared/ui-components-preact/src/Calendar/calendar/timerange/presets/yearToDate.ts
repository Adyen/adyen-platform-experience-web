import createRangeTimestampsFactory from '../factory';
import { nowTimestamp } from '../utils';
import { startOfYear } from '../../utils';

const yearToDate = createRangeTimestampsFactory({
    from: ({ now, timezone }) => startOfYear(now, timezone),
    to: nowTimestamp,
});

export default yearToDate;
