export const enum BankAccountNumberFormattingSeparator {
    DASH = '-',
    NBSP = ' ',
    SPACE = ' ',
}

export interface BankAccountNumberFormattingOptions {
    separator?: BankAccountNumberFormattingSeparator | string;
}
