import { TranslationKey } from '../../../../../../translations';

const getHumanReadableIban = (iban: string, useNonBreakingSpaces = true) => {
    const spaceSeparator = useNonBreakingSpaces ? ' ' : ' ';
    const ibanWithoutSpaces = iban.replace(/\s+/g, '');
    return ibanWithoutSpaces.replace(/([A-Z\d]{4}(?!$))/gi, `$1${spaceSeparator}`);
};

const isCopyableAccountField = (field: string): boolean => {
    switch (field) {
        // Explicit list of copyable account fields
        case 'accountNumber':
        case 'beneficiaryName':
        case 'iban':
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
        case 'accountNumber':
            return 'capital.overview.repayment.actions.copyAccountNumber';
        case 'beneficiaryName':
            return 'capital.overview.repayment.actions.copyBeneficiaryName';
        case 'iban':
            return 'capital.overview.repayment.actions.copyIban';
        case 'routingNumber':
            return 'capital.overview.repayment.actions.copyRoutingNumber';
        case 'sortCode':
            return 'capital.overview.repayment.actions.copySortCode';
    }
};

export const getAccountFieldTranslationKey = (field: string): TranslationKey => {
    switch (field) {
        case 'accountNumber':
            return 'capital.overview.repayment.accountDetails.fields.accountNumber';
        case 'beneficiaryName':
            return 'capital.overview.repayment.accountDetails.fields.beneficiaryName';
        case 'iban':
            return 'capital.overview.repayment.accountDetails.fields.iban';
        case 'region':
            return 'capital.overview.repayment.accountDetails.fields.countryOrRegion';
        case 'routingNumber':
            return 'capital.overview.repayment.accountDetails.fields.routingNumber';
        case 'sortCode':
            return 'capital.overview.repayment.accountDetails.fields.sortCode';
        default:
            return field as TranslationKey;
    }
};

export const isAccountFieldPrimary = (field: string): boolean => {
    switch (field) {
        case 'accountNumber':
        case 'iban':
        case 'routingNumber':
        case 'sortCode':
            return true;

        case 'beneficiaryName':
        case 'region':
        default:
            return false;
    }
};
