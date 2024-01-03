import { clamp } from '@src/utils/common';
import createTimeRange from '../createTimeRange';
import { startOfDay } from '../utils';

const MAX_NUM_DAYS = 365;
const MIN_NUM_DAYS = 1;
const DEFAULT_NUM_DAYS = MIN_NUM_DAYS;

const lastNDays = (numberOfDays?: number) => {
    const days = ~~clamp(MIN_NUM_DAYS, numberOfDays as number, MAX_NUM_DAYS) || DEFAULT_NUM_DAYS;

    return createTimeRange({
        get to() {
            return startOfDay(new Date()) - 1;
        },
        offset: Object.freeze([0, 0, days, 23, 59, 59, 999]),
    });
};

export default lastNDays;
