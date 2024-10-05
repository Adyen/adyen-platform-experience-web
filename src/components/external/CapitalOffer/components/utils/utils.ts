import { DAY_MS } from '../../../../internal/Calendar/calendar/constants';
import { parseDate } from '../../../../../utils';

const dateStartUTCTimestampOffset = (date: Date | number | string, numberOfDays = 0) => {
    return new Date(new Date(date).setUTCHours(0, 0, 0, 0) + Math.floor(numberOfDays) * DAY_MS);
};

export const getExpectedRepaymentDate = (expectedRepaymentPeriodDays: number) => {
    return parseDate(dateStartUTCTimestampOffset(new Date(), expectedRepaymentPeriodDays));
};
