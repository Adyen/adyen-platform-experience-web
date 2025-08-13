import { TranslationKey } from '../../../../../translations';

const getHumanReadableIban = (iban: string, useNonBreakingSpaces = true) => {
    const spaceSeparator = useNonBreakingSpaces ? ' ' : ' ';
    const ibanWithoutSpaces = iban.replace(/\s+/g, '');
    return ibanWithoutSpaces.replace(/([A-Z\d]{4}(?!$))/gi, `$1${spaceSeparator}`);
};

const isCopyableAccountField = (field: string): boolean => {
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

export const getAccountFieldTextToCopy = (field: string, value?: string): string | undefined => {
    return isCopyableAccountField(field) ? value : undefined;
};

export const getAccountFieldFormattedValue = (field: string, value?: string) => {
    switch (field) {
        case 'iban':
            return value && getHumanReadableIban(value);
        default:
            return value;
    }
};

export const getAccountFieldCopyButtonLabelKey = (field: string): TranslationKey | undefined => {
    switch (field) {
        // Explicit list of copyable account fields
        case 'iban':
            return 'capital.sendRepayment.copyIban';
        case 'accountNumber':
            return 'capital.sendRepayment.copyAccountNumber';
        case 'routingNumber':
            return 'capital.sendRepayment.copyRoutingNumber';
        case 'sortCode':
            return 'capital.sendRepayment.copySortCode';
    }
};

export const getAccountFieldTranslationKey = (field: string): TranslationKey => {
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
            return field as TranslationKey;
    }
};
