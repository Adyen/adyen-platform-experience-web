import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../../translations';
import { EMPTY_ARRAY } from '../../../../../utils';
import { BankAccountField } from './types';

type I18n = ReturnType<typeof useCoreContext>['i18n'];

const [
    ACCOUNT_NUMBER = 'accountNumber',
    ACCOUNT_TYPE = 'accountType',
    BANK_CODE = 'bankCode',
    BIC = 'bic',
    BRANCH_NUMBER = 'branchNumber',
    BSB_CODE = 'bsbCode',
    CLEARING_NUMBER = 'clearingNumber',
    IBAN = 'iban',
    INSTITUTION_NUMBER = 'institutionNumber',
    ISPB_CODE = 'ispbCode',
    REGION = 'region',
    ROUTING_NUMBER = 'routingNumber',
    SORT_CODE = 'sortCode',
    TRANSIT_NUMBER = 'transitNumber',
] = EMPTY_ARRAY;

const getHumanReadableIban = (iban: string, useNonBreakingSpaces = true) => {
    const spaceSeparator = useNonBreakingSpaces ? ' ' : ' ';
    const ibanWithoutSpaces = iban.replace(/\s+/g, '');
    return ibanWithoutSpaces.replace(/([A-Z\d]{4}(?!$))/gi, `$1${spaceSeparator}`);
};

const isCopyableAccountField = (field: BankAccountField): boolean => {
    switch (field) {
        // Explicit list of copyable account fields
        case ACCOUNT_NUMBER:
        case BIC:
        case BSB_CODE:
        case IBAN:
        case ISPB_CODE:
        case ROUTING_NUMBER:
        case SORT_CODE:
            return true;

        // Explicit list of non-copyable account fields
        // Items can be moved from this list to the list of copyable fields if necessary
        // The `region` field and other unknown fields (default case) are also considered non-copyable
        case ACCOUNT_TYPE:
        case 'additionalBankIdentification':
        case BANK_CODE:
        case BRANCH_NUMBER:
        case CLEARING_NUMBER:
        case INSTITUTION_NUMBER:
        case TRANSIT_NUMBER:
        case REGION:
        default:
            return false;
    }
};

export const getAccountFieldTextToCopy = (field: BankAccountField, value: string): string | undefined => {
    return isCopyableAccountField(field) ? value : undefined;
};

const getTranslationWithFallback = (i18n: I18n, translationKey: TranslationKey, fallback: string): string => {
    const translation = i18n.get(translationKey);
    return translation && translation !== translationKey ? translation : fallback;
};

export const getAccountFieldFormattedValue = (field: BankAccountField, value: string, i18n: I18n) => {
    switch (field) {
        case REGION:
            return getTranslationWithFallback(i18n, `countryOrRegion.${value}` as TranslationKey, value);
        case IBAN:
            return getHumanReadableIban(value);
        case ACCOUNT_TYPE:
            return getTranslationWithFallback(i18n, `bankAccountType.${value.toLowerCase()}` as TranslationKey, value);
        default:
            return value;
    }
};

export const getAccountFieldTranslationKey = (field: BankAccountField): TranslationKey => {
    switch (field) {
        case REGION:
            return 'capital.bankCountryOrRegion';
        case IBAN:
            return 'IBAN' as TranslationKey; // [TODO]: Verify if "IBAN" can and should be translated
        case ACCOUNT_NUMBER:
            return 'capital.bankAccountNumber';
        case ACCOUNT_TYPE:
            return 'capital.bankAccountType';
        case BANK_CODE:
            return 'capital.bankCode';
        case BIC:
            return 'BIC' as TranslationKey; // [TODO]: Verify if "BIC" can and should be translated
        case BRANCH_NUMBER:
            return 'capital.bankBranchNumber';
        case BSB_CODE:
            return 'capital.bankBsbCode';
        case CLEARING_NUMBER:
            return 'capital.bankClearingNumber';
        case INSTITUTION_NUMBER:
            return 'capital.bankInstitutionNumber';
        case ISPB_CODE:
            return 'capital.bankIspbCode';
        case ROUTING_NUMBER:
            return 'capital.bankRoutingNumber';
        case SORT_CODE:
            return 'capital.bankSortCode';
        case TRANSIT_NUMBER:
            return 'capital.bankTransitNumber';
        default:
            return field as TranslationKey;
    }
};
