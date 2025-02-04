import { asPlainObject, EMPTY_OBJECT } from '../../../../../../utils';
import { AccountNumberFormattingOptions, AccountNumberFormattingSeparator } from './types';

export const getFormattedAccountNumber = (accountNumber: string, formattingOptions: AccountNumberFormattingOptions = EMPTY_OBJECT) => {
    const { separator = AccountNumberFormattingSeparator.NBSP } = asPlainObject(formattingOptions);
    return accountNumber.replace(/([A-Z0-9]{4})/g, `$1${separator}`);
};
