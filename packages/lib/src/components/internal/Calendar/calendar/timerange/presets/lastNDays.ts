import { enumerable } from '@src/utils/common';
import createRangeTimestampsFactory from '../factory';
import { getClampedIntegerValue, offsetForNDays, startOfDay } from '../utils';

export const MAX_NUM_DAYS = 365;
export const MIN_NUM_DAYS = 1;
export const DEFAULT_NUM_DAYS = MIN_NUM_DAYS;

const lastNDays = (numberOfDays?: number) => {
    const normalizedNumberOfDays = getClampedIntegerValue(MIN_NUM_DAYS, MAX_NUM_DAYS, numberOfDays, DEFAULT_NUM_DAYS);

    return createRangeTimestampsFactory(
        {
            to: ({ now }) => startOfDay(new Date(now)) - 1,
            offset: offsetForNDays(normalizedNumberOfDays),
        },
        { numberOfDays: enumerable(normalizedNumberOfDays) }
    )();
};

export default lastNDays;
