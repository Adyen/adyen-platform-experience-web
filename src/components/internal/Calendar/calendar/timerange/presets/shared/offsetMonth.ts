import { clamp } from '../../../../../../../utils';
import createRangeTimestampsFactory from '../../factory';
import type { RangeTimestampOffsets } from '../../types';
import { nowTimestamp } from '../../utils';
import { startOfMonth } from '../../../utils';

export const ONE_MONTH_OFFSETS = Object.freeze([0, 1, 0, 0, 0, 0, -1] as const) as RangeTimestampOffsets;

const offsetMonth = (monthCount: number = 0) => {
    const months = ~~clamp(0, monthCount as number, Infinity) || 0;
    const restConfig = months ? { offsets: ONE_MONTH_OFFSETS } : { to: nowTimestamp };

    return createRangeTimestampsFactory({
        from: ({ now, timezone, systemToTimezone, timezoneToSystem }) => {
            const date = new Date(timezoneToSystem(startOfMonth(now, timezone)));
            date.setMonth(date.getMonth() - months);
            return systemToTimezone(date);
        },
        ...restConfig,
    });
};

export default offsetMonth;
