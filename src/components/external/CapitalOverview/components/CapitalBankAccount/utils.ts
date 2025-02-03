import { asPlainObject, EMPTY_OBJECT } from '../../../../../utils';
import { BankAccountNumberFormattingOptions, BankAccountNumberFormattingSeparator } from './types';

export const getFormattedBankAccountNumber = (accountNumber: string, formattingOptions: BankAccountNumberFormattingOptions = EMPTY_OBJECT) => {
    const { separator = BankAccountNumberFormattingSeparator.NBSP } = asPlainObject(formattingOptions);
    return accountNumber.replace(/([A-Z0-9]{4})/g, `$1${separator}`);
};

// [TODO]: Verify whether this util function is relevant or not
export const getFormattedBankAccountRegion = (region: string) => {
    return region === 'US'
        ? 'United States' // [TODO]: Consider translating this country name
        : region;
};
