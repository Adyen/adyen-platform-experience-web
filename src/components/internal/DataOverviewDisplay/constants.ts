const DIGITS_2 = '2-digit';
const LONG = 'long';
const NUMERIC = 'numeric';
const SHORT = 'short';
const SHORT_OFFSET = 'shortOffset';

export const DATE_FORMAT_TRANSACTIONS: Intl.DateTimeFormatOptions = {
    month: SHORT,
    day: NUMERIC,
    hour: DIGITS_2,
    minute: DIGITS_2,
    hour12: false,
};

export const DATE_FORMAT_REPORTS_MOBILE: Intl.DateTimeFormatOptions = DATE_FORMAT_TRANSACTIONS;

export const DATE_FORMAT_TRANSACTION_DETAILS: Intl.DateTimeFormatOptions = {
    weekday: LONG,
    month: LONG,
    year: NUMERIC,
    hour: DIGITS_2,
    minute: DIGITS_2,
    timeZoneName: SHORT_OFFSET,
};

export const DATE_FORMAT_PAYOUTS: Intl.DateTimeFormatOptions = {
    month: LONG,
    day: NUMERIC,
    year: NUMERIC,
};

export const DATE_FORMAT_PAYOUTS_DETAILS: Intl.DateTimeFormatOptions = {
    ...DATE_FORMAT_PAYOUTS,
    weekday: LONG,
};

export const DATE_FORMAT_REPORT_FILE_NAME: Intl.DateTimeFormatOptions = {
    year: NUMERIC,
    month: DIGITS_2,
    day: DIGITS_2,
};
