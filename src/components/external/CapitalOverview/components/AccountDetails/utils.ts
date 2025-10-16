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
            return 'capital.overview.sendRepayment.actions.copyIban';
        case 'accountNumber':
            return 'capital.overview.sendRepayment.actions.copyAccountNumber';
        case 'routingNumber':
            return 'capital.overview.sendRepayment.actions.copyRoutingNumber';
        case 'sortCode':
            return 'capital.overview.sendRepayment.actions.copySortCode';
    }
};

export const getAccountFieldTranslationKey = (field: string): TranslationKey => {
    switch (field) {
        case 'region':
            return 'capital.overview.sendRepayment.accountDetails.fields.countryOrRegion';
        case 'iban':
            return 'capital.overview.sendRepayment.accountDetails.fields.accountIban';
        case 'accountNumber':
            return 'capital.overview.sendRepayment.accountDetails.fields.accountNumber';
        case 'routingNumber':
            return 'capital.overview.sendRepayment.accountDetails.fields.routingNumber';
        case 'sortCode':
            return 'capital.overview.sendRepayment.accountDetails.fields.sortCode';
        default:
            return field as TranslationKey;
    }
};
