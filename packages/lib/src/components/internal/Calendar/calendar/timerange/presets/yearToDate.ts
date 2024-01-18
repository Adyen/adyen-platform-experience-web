import createRangeTimestampsFactory from '../factory';
import { nowTimestamp, timezoneAwareStartOfYear } from '../utils';

const yearToDate = createRangeTimestampsFactory({
    from: ({ now, restamp }) => timezoneAwareStartOfYear(restamp, now),
    to: nowTimestamp,
});

export default yearToDate;
