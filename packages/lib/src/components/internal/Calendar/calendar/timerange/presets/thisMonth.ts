import createRangeTimestampsFactory from '../factory';
import { nowTimestamp, timezoneAwareStartOfMonth } from '../utils';

const thisMonth = createRangeTimestampsFactory({
    from: ({ now, restamp }) => timezoneAwareStartOfMonth(restamp, now),
    to: nowTimestamp,
});

export default thisMonth;
