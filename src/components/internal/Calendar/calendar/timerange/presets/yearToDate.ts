import createRangeTimestampsFactory from '../factory';
import { nowTimestamp, startOfYear } from '../utils';

const yearToDate = createRangeTimestampsFactory({
    from: ({ now, systemToTimezone, timezoneToSystem }) => {
        const date = new Date(now);
        const restampedDate = new Date(timezoneToSystem(now));
        const yearOffset = (date.getFullYear() - restampedDate.getFullYear()) as -1 | 1 | 0;

        startOfYear(date);
        date.setFullYear(date.getFullYear() - yearOffset);
        return systemToTimezone(date);
    },
    to: nowTimestamp,
});

export default yearToDate;
