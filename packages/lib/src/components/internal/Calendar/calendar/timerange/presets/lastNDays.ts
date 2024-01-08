import createRangeTimestampsFactory from '../factory';
import { getRangeTimestampsContextIntegerPropertyFactory, offsetForNDays, startOfDay } from '../utils';

export const MAX_NUM_DAYS = 365;
export const MIN_NUM_DAYS = 1;
export const DEFAULT_NUM_DAYS = 1;

const _getNumberOfDaysContext = getRangeTimestampsContextIntegerPropertyFactory<number>(MIN_NUM_DAYS, MAX_NUM_DAYS, DEFAULT_NUM_DAYS);

const lastNDays = (numberOfDays?: number) => {
    const numberOfDaysContext = _getNumberOfDaysContext(numberOfDays);

    return createRangeTimestampsFactory(
        {
            to: ({ now }) => startOfDay(new Date(now)) - 1,
            offset: () => offsetForNDays(numberOfDaysContext.value),
        },
        { numberOfDays: numberOfDaysContext.descriptor }
    )();
};

export default lastNDays;
