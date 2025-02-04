import { asPlainObject, EMPTY_OBJECT } from '../../../../../utils';
import { BankAccountNumberFormattingOptions, BankAccountNumberFormattingSeparator } from './types';

export const getFormattedBankAccountNumber = (accountNumber: string, formattingOptions: BankAccountNumberFormattingOptions = EMPTY_OBJECT) => {
    const { separator = BankAccountNumberFormattingSeparator.NBSP } = asPlainObject(formattingOptions);
    return accountNumber.replace(/([A-Z0-9]{4})/g, `$1${separator}`);
};
