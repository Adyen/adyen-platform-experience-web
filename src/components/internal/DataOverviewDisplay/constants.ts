export const DATE_FORMAT_TRANSACTIONS: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: undefined,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
};

export const DATE_FORMAT_TRANSACTION_DETAILS: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'shortOffset',
};

export const DATE_FORMAT_PAYOUTS: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
};

export const DATE_FORMAT_PAYOUTS_DETAILS: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
};
