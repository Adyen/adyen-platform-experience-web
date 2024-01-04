import { clamp, enumerable } from '@src/utils/common';
import createRangeTimestampsFactory from '../factory';
import { startOfDay } from '../utils';

const MAX_NUM_DAYS = 365;
const MIN_NUM_DAYS = 1;
const DEFAULT_NUM_DAYS = MIN_NUM_DAYS;

const lastNDays = (numberOfDays?: number) => {
    const days = ~~clamp(MIN_NUM_DAYS, numberOfDays as number, MAX_NUM_DAYS) || DEFAULT_NUM_DAYS;

    return createRangeTimestampsFactory(
        {
            to: ({ now }) => startOfDay(new Date(now)) - 1,
            offset: Object.freeze([0, 0, days - 1, 23, 59, 59, 999]),
        },
        { numberOfDays: enumerable(days) }
    )();
};

export default lastNDays;
