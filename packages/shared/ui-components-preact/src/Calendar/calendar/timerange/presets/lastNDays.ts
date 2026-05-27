import createRangeTimestampsFactory from '../factory';
import { getRangeTimestampsContextIntegerPropertyFactory, nowTimestamp } from '../utils';
import { startOfDay } from '../../utils';

export const MAX_NUM_DAYS = 365;
export const MIN_NUM_DAYS = 1;
export const DEFAULT_NUM_DAYS = 1;

const _getNumberOfDaysContext = getRangeTimestampsContextIntegerPropertyFactory<number>(MIN_NUM_DAYS, MAX_NUM_DAYS, DEFAULT_NUM_DAYS);

const lastNDays = (numberOfDays?: number) => {
    const numberOfDaysContext = _getNumberOfDaysContext(numberOfDays);

    return createRangeTimestampsFactory(
        {
            from: ({ now, timezone, systemToTimezone, timezoneToSystem }) => {
                const date = new Date(timezoneToSystem(startOfDay(now, timezone)));
                date.setDate(date.getDate() - numberOfDaysContext.value + 1);
                return systemToTimezone(date);
            },
            to: nowTimestamp,
        },
        { numberOfDays: numberOfDaysContext.descriptor }
    )();
};

export default lastNDays;
