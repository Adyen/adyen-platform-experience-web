import createRangeTimestampsFactory from '../factory';
import { getRangeTimestampsContextIntegerPropertyFactory, nowTimestamp } from '../utils';
import { startOfMonth } from '../../utils';

export const MAX_NUM_MONTHS = 12;
export const MIN_NUM_MONTHS = 1;
export const DEFAULT_NUM_MONTHS = 1;

const _getNumberOfMonthsContext = getRangeTimestampsContextIntegerPropertyFactory<number>(MIN_NUM_MONTHS, MAX_NUM_MONTHS, DEFAULT_NUM_MONTHS);

const lastNMonths = (numberOfMonths?: number) => {
    const numberOfMonthsContext = _getNumberOfMonthsContext(numberOfMonths);

    return createRangeTimestampsFactory(
        {
            from: ({ now, timezone, systemToTimezone, timezoneToSystem }) => {
                const date = new Date(timezoneToSystem(startOfMonth(now, timezone)));
                date.setMonth(date.getMonth() - numberOfMonthsContext.value + 1);
                return systemToTimezone(date);
            },
            to: nowTimestamp,
        },
        { numberOfMonths: numberOfMonthsContext.descriptor }
    )();
};

export default lastNMonths;
