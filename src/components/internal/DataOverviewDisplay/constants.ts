const DIGIT_2 = '2-digit';
const NUMERIC = 'numeric';
const SHORT = 'short';
const LONG = 'long';

const BASE_DATE_FORMAT: Intl.DateTimeFormatOptions = {
    month: LONG,
    day: NUMERIC,
    year: NUMERIC,
};

const BASE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
    hour: DIGIT_2,
    minute: DIGIT_2,
};

const BASE_DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_FORMAT,
    ...BASE_TIME_FORMAT,
    month: SHORT,
    hour12: false,
};

export const DATE_FORMAT_PAYOUTS: Intl.DateTimeFormatOptions = BASE_DATE_FORMAT;

export const DATE_FORMAT_MOBILE_PAYOUTS: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_TIME_FORMAT,
    year: undefined,
};

export const DATE_FORMAT_PAYOUTS_DETAILS: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_FORMAT,
    weekday: LONG,
};

export const DATE_FORMAT_TRANSACTIONS: Intl.DateTimeFormatOptions = BASE_DATE_TIME_FORMAT;

export const DATE_FORMAT_MOBILE_TRANSACTIONS: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_TIME_FORMAT,
    year: undefined,
};

export const DATE_FORMAT_TRANSACTION_DETAILS: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_FORMAT,
    ...BASE_TIME_FORMAT,
    weekday: LONG,
    timeZoneName: 'shortOffset',
};
