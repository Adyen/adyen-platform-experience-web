import { DAY_MS } from '@integration-components/ui-components-preact/Calendar/calendar/constants';
import { parseDate } from '../../../../../utils';

const dateStartUTCTimestampOffset = (date: Date | number | string, numberOfDays = 0) => {
    return new Date(new Date(date).setUTCHours(0, 0, 0, 0) + Math.floor(numberOfDays) * DAY_MS);
};

export const getExpectedRepaymentDate = (expectedRepaymentPeriodDays: number) => {
    return parseDate(dateStartUTCTimestampOffset(new Date(), expectedRepaymentPeriodDays));
};

export const calculateMaximumRepaymentPeriodInMonths = (days?: number) => (days ? Math.ceil(days / 30) : null);

export const getPercentage = (rate: number) => {
    return rate / 100;
};
