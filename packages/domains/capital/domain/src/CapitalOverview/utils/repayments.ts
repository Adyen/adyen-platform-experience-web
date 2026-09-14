import type { IGBCapitalFundsCollection, IGrant, INLCapitalFundsCollection, IUSCapitalFundsCollection } from '@integration-components/types';
import { TranslationKey } from '@integration-components/core';
import { KeyOfRecord } from '@integration-components/utils/types';

export type CapitalBankAccount = NonNullable<IGrant['unscheduledRepaymentAccounts']>[number] &
    Partial<Omit<INLCapitalFundsCollection, 'region'> & Omit<IUSCapitalFundsCollection, 'region'> & Omit<IGBCapitalFundsCollection, 'region'>>;

export type CapitalBankAccountField = Exclude<KeyOfRecord<CapitalBankAccount>, 'order'>;

export type AccountFieldMetadata = {
    isCopyable: boolean;
    isPrimary: boolean;
};

export type AccountDetail = {
    content: string;
    copyButtonLabel?: TranslationKey;
    field: string;
    isPrimary: boolean;
    label: TranslationKey;
    textToCopy?: string;
};

const getHumanReadableIban = (iban: string) => {
    const separator = ' ';
    const ibanWithoutSpaces = iban.replace(/\s+/g, '');
    return ibanWithoutSpaces.replace(/([A-Z\d]{4}(?!$))/gi, `$1${separator}`);
};

const getBankAccountFieldMetadata = (field: string): AccountFieldMetadata => ({
    isCopyable: ['accountNumber', 'beneficiaryName', 'iban', 'routingNumber', 'sortCode'].includes(field),
    isPrimary: ['accountNumber', 'iban', 'routingNumber', 'sortCode'].includes(field),
});

export const getBankAccount = (grant: IGrant) => grant.unscheduledRepaymentAccounts?.[0];

export const getTransferInstrumentIds = (grant: IGrant) => grant.transferInstruments?.map(({ accountIdentifier }) => accountIdentifier) ?? [];

export const getBankAccountFields = (bankAccount: CapitalBankAccount): string[] => {
    const { accountNumber, iban, order, region, ...accountDetails } = bankAccount;
    const accountFields = Object.keys({ iban, accountNumber, ...accountDetails, region });
    const orderedFields = Array.isArray(order) ? order.filter(field => accountFields.includes(field)) : accountFields;
    return [...new Set(orderedFields)];
};

export const getBankAccountDetails = (bankAccount: CapitalBankAccount): AccountDetail[] => {
    const details: AccountDetail[] = [];

    for (const field of getBankAccountFields(bankAccount)) {
        const value = bankAccount[field as CapitalBankAccountField];

        if (typeof value !== 'string' || !value) {
            continue;
        }

        const content = getBankAccountFieldFormattedValue(field, value);

        if (!content) {
            continue;
        }

        details.push({
            content,
            copyButtonLabel: getBankAccountFieldCopyButtonTranslationKey(field),
            field,
            isPrimary: isBankAccountFieldPrimary(field),
            label: getBankAccountFieldTranslationKey(field),
            textToCopy: getBankAccountFieldTextToCopy(field, value),
        });
    }

    return details;
};

export const isBankAccountFieldPrimary = (field: string): boolean => {
    return getBankAccountFieldMetadata(field).isPrimary;
};

export const getBankAccountFieldFormattedValue = (field: string, value?: string) => {
    return field === 'iban' && value ? getHumanReadableIban(value) : value;
};

export const getBankAccountFieldTextToCopy = (field: string, value?: string) => {
    return getBankAccountFieldMetadata(field).isCopyable ? value : undefined;
};

export const getBankAccountFieldCopyButtonTranslationKey = (field: string): TranslationKey | undefined => {
    switch (field) {
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

export const getBankAccountFieldTranslationKey = (field: string): TranslationKey => {
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
