import { SIZES, SIZES_SYMBOLS, WEEKEND_DAYS_SEED } from './constants';
import { TimeFrameBlockSize, TimeFrameSize } from './types';
import { WeekDay } from '../shared/types';
import { mod } from '../shared/utils';

export const downsizeTimeFrame = (size: TimeFrameBlockSize, maxsize: number): TimeFrameBlockSize => {
    if (maxsize >= size) return size;
    let i = Math.max(1, SIZES.indexOf(size));
    while (--i && maxsize < (SIZES[i] as TimeFrameBlockSize)) {}
    return SIZES[i] as TimeFrameBlockSize;
};

export const resolveTimeFrameBlockSize = (size: TimeFrameSize) => {
    const index = Math.max(typeof size === 'symbol' ? SIZES_SYMBOLS.indexOf(size) : SIZES.indexOf(size), 0);
    return SIZES[index];
};

export const getWeekendDays = (firstWeekDay: WeekDay = 0) =>
    // [TODO]: Derive weekend days by locale
    Object.freeze(WEEKEND_DAYS_SEED.map(seed => mod(6 - firstWeekDay + seed, 7)) as [WeekDay, WeekDay]);
