export const enum AccountNumberFormattingSeparator {
    DASH = '-',
    NBSP = ' ',
    SPACE = ' ',
}

export interface AccountNumberFormattingOptions {
    separator?: AccountNumberFormattingSeparator | string;
}
