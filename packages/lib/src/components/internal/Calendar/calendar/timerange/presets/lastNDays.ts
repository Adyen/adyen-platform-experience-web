import createRangeTimestampsFactory from '../factory';
import { getRangeTimestampsContextIntegerPropertyFactory, nowTimestamp, startOfDay } from '../utils';

export const MAX_NUM_DAYS = 365;
export const MIN_NUM_DAYS = 1;
export const DEFAULT_NUM_DAYS = 1;

const _getNumberOfDaysContext = getRangeTimestampsContextIntegerPropertyFactory<number>(MIN_NUM_DAYS, MAX_NUM_DAYS, DEFAULT_NUM_DAYS);

const lastNDays = (numberOfDays?: number) => {
    const numberOfDaysContext = _getNumberOfDaysContext(numberOfDays);

    return createRangeTimestampsFactory(
        {
            from: ({ now, system2Timezone, timezone2System, timezoneOffset }) => {
                const date = new Date(now);
                let dateOffset = numberOfDaysContext.value - 1;

                if (timezoneOffset(startOfDay(date))) {
                    const restampedDate = new Date(timezone2System(now));
                    const dateDiff = (date.getDate() - restampedDate.getDate()) as -1 | 1 | 0;

                    if (dateDiff) {
                        // Correction for difference between first (1) and last (28, 29, 30, 31) day of month
                        dateOffset += dateDiff > 1 ? -1 : dateDiff < -1 ? 1 : dateDiff;
                    }
                }

                return system2Timezone(date.setDate(date.getDate() - dateOffset));
            },
            to: nowTimestamp,
        },
        { numberOfDays: numberOfDaysContext.descriptor }
    )();
};

export default lastNDays;
