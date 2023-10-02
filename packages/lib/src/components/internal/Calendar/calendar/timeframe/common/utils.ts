import { FRAME_SIZES, WEEKEND_DAYS_SEED } from '../../constants';
import { FirstWeekDay, TimeFrameSize, WeekDay } from '../../types';
import { mod } from '../../shared/utils';

export const downsizeTimeFrame = (size: TimeFrameSize, maxsize: number): TimeFrameSize => {
    if (maxsize >= size) return size;
    let i = Math.max(1, FRAME_SIZES.indexOf(size));
    while (--i && maxsize < (FRAME_SIZES[i] as TimeFrameSize)) {}
    return FRAME_SIZES[i] as TimeFrameSize;
};

export const resolveTimeFrameBlockSize = (size: TimeFrameSize) => FRAME_SIZES[Math.max(FRAME_SIZES.indexOf(size), 0)];

export const getWeekendDays = (firstWeekDay: FirstWeekDay = 0) =>
    // [TODO]: Derive weekend days based on locale
    Object.freeze(WEEKEND_DAYS_SEED.map(seed => mod(6 - firstWeekDay + seed, 7)) as [WeekDay, WeekDay]);
