const DIGITS_2 = '2-digit';
const LONG = 'long';
const NUMERIC = 'numeric';
const SHORT = 'short';
const SHORT_OFFSET = 'shortOffset';

const BASE_DATE_FORMAT: Intl.DateTimeFormatOptions = {
    month: LONG,
    day: NUMERIC,
    year: NUMERIC,
};

const BASE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
    hour: DIGITS_2,
    minute: DIGITS_2,
};

const BASE_DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_FORMAT,
    ...BASE_TIME_FORMAT,
    month: SHORT,
    hour12: false,
};

const BASE_DATE_TIME_MOBILE_FORMAT: Intl.DateTimeFormatOptions = { ...BASE_DATE_TIME_FORMAT, year: undefined };

// Capital
export const DATE_FORMAT_CAPITAL_OVERVIEW: Intl.DateTimeFormatOptions = { ...BASE_DATE_FORMAT, month: 'short' };
export const DATE_FORMAT_MISSING_ACTION: Intl.DateTimeFormatOptions = { ...BASE_DATE_FORMAT, month: 'long' };

// Disputes
export const DATE_FORMAT_DISPUTES: Intl.DateTimeFormatOptions = BASE_DATE_FORMAT;
export const DATE_FORMAT_DISPUTE_DETAILS: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_TIME_FORMAT,
    hour12: true,
    timeZoneName: SHORT_OFFSET,
};

// PayByLink
export const DATE_FORMAT_PAYMENT_LINKS_OVERVIEW: Intl.DateTimeFormatOptions = BASE_DATE_TIME_FORMAT;
export const DATE_FORMAT_PAYMENT_LINKS_OVERVIEW_EXPIRATION_DATE: Intl.DateTimeFormatOptions = BASE_DATE_TIME_FORMAT;
export const DATE_FORMAT_PAYMENT_LINK_DETAILS_TABS: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_TIME_FORMAT,
    month: LONG,
    ...BASE_TIME_FORMAT,
    timeZoneName: SHORT_OFFSET,
};
export const DATE_FORMAT_PAYMENT_LINK_DETAILS_SUMMARY: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_TIME_FORMAT,
    month: LONG,
    weekday: LONG,
    timeZoneName: SHORT_OFFSET,
};

// Payouts
export const DATE_FORMAT_PAYOUTS: Intl.DateTimeFormatOptions = BASE_DATE_FORMAT;
export const DATE_FORMAT_PAYOUTS_MOBILE: Intl.DateTimeFormatOptions = BASE_DATE_TIME_MOBILE_FORMAT;
export const DATE_FORMAT_PAYOUT_DETAILS: Intl.DateTimeFormatOptions = { ...BASE_DATE_FORMAT, weekday: LONG };

// Reports
export const DATE_FORMAT_REPORTS: Intl.DateTimeFormatOptions = { ...BASE_DATE_FORMAT, month: SHORT };

// Transactions
export const DATE_FORMAT_TRANSACTIONS: Intl.DateTimeFormatOptions = BASE_DATE_TIME_FORMAT;
export const DATE_FORMAT_TRANSACTIONS_MOBILE: Intl.DateTimeFormatOptions = BASE_DATE_TIME_MOBILE_FORMAT;
export const DATE_FORMAT_TRANSACTION_DETAILS: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_FORMAT,
    ...BASE_TIME_FORMAT,
    weekday: LONG,
    timeZoneName: SHORT_OFFSET,
};

// Other
export const DATE_FORMAT_RESPONSE_DEADLINE: Intl.DateTimeFormatOptions = {
    month: SHORT,
    weekday: LONG,
    hour: DIGITS_2,
    minute: NUMERIC,
    year: undefined,
    timeZoneName: SHORT_OFFSET,
};
export const DATE_FORMAT_DELIVERY_DATE: Intl.DateTimeFormatOptions = {
    month: SHORT,
    weekday: LONG,
    hour: undefined,
    minute: undefined,
    year: 'numeric',
    timeZoneName: undefined,
};
