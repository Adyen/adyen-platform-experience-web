import { TranslationKey } from '../../../../../translations';
import { BankAccountField } from './types';

const getHumanReadableIban = (iban: string, useNonBreakingSpaces = true) => {
    const spaceSeparator = useNonBreakingSpaces ? ' ' : ' ';
    const ibanWithoutSpaces = iban.replace(/\s+/g, '');
    return ibanWithoutSpaces.replace(/([A-Z\d]{4}(?!$))/gi, `$1${spaceSeparator}`);
};

const isCopyableAccountField = (field: BankAccountField): boolean => {
    switch (field) {
        // Explicit list of copyable account fields
        case 'iban':
        case 'accountNumber':
        case 'routingNumber':
        case 'sortCode':
            return true;

        // Explicit list of non-copyable account fields
        // Items can be moved from this list to the list of copyable fields if necessary
        // The `region` field and other unknown fields (default case) are also considered non-copyable
        case 'region':
        default:
            return false;
    }
};

export const getAccountFieldTextToCopy = (field: BankAccountField, value: string): string | undefined => {
    return isCopyableAccountField(field) ? value : undefined;
};

export const getAccountFieldFormattedValue = (field: BankAccountField, value: string) => {
    switch (field) {
        case 'iban':
            return getHumanReadableIban(value);
        default:
            return value;
    }
};

export const getAccountFieldTranslationKey = (field: BankAccountField): TranslationKey | undefined => {
    switch (field) {
        case 'region':
            return 'capital.bankCountryOrRegion';
        case 'iban':
            return 'capital.bankAccountIban';
        case 'accountNumber':
            return 'capital.bankAccountNumber';
        case 'routingNumber':
            return 'capital.bankRoutingNumber';
        case 'sortCode':
            return 'capital.bankSortCode';
        default:
            return;
    }
};
