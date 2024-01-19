import { clamp } from '@src/utils/common';
import createRangeTimestampsFactory from '../../factory';
import type { RangeTimestampOffsets } from '../../types';
import { nowTimestamp, startOfMonth } from '../../utils';

export const ONE_MONTH_OFFSETS = Object.freeze([0, 1, 0, 0, 0, 0, -1] as const) as RangeTimestampOffsets;

const offsetMonth = (monthCount: number = 0) => {
    const months = ~~clamp(0, monthCount as number, Infinity) || 0;
    const restConfig = months ? { offsets: ONE_MONTH_OFFSETS } : { to: nowTimestamp };

    return createRangeTimestampsFactory({
        from: ({ now, system2Timezone, timezone2System, timezoneOffset }) => {
            const date = new Date(now);
            let monthOffset = months;

            if (timezoneOffset(startOfMonth(date))) {
                const restampedDate = new Date(timezone2System(now));
                const monthDiff = (date.getMonth() - restampedDate.getMonth()) as -1 | 1 | 0;

                if (monthDiff) {
                    // Correction for difference between first (0) and last (11) month
                    monthOffset += monthDiff > 1 ? -1 : monthDiff < -1 ? 1 : monthDiff;
                }
            }

            return system2Timezone(date.setMonth(date.getMonth() - monthOffset));
        },
        ...restConfig,
    });
};

export default offsetMonth;
