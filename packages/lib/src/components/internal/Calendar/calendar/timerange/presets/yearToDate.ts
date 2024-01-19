import createRangeTimestampsFactory from '../factory';
import { nowTimestamp, startOfYear } from '../utils';

const yearToDate = createRangeTimestampsFactory({
    from: ({ now, system2Timezone, timezone2System, timezoneOffset }) => {
        const date = new Date(now);

        if (timezoneOffset(startOfYear(date))) {
            const restampedDate = new Date(timezone2System(now));
            const yearOffset = (date.getFullYear() - restampedDate.getFullYear()) as -1 | 1 | 0;
            date.setFullYear(date.getFullYear() - yearOffset);
        }

        return system2Timezone(date);
    },
    to: nowTimestamp,
});

export default yearToDate;
