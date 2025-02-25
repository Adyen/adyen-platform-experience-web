import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../../translations';
import { BankAccountField } from './types';

type I18n = ReturnType<typeof useCoreContext>['i18n'];

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

const getTranslationWithFallback = (i18n: I18n, translationKey: TranslationKey, fallback: string): string => {
    const translation = i18n.get(translationKey);
    return translation && translation !== translationKey ? translation : fallback;
};

export const getAccountFieldFormattedValue = (field: BankAccountField, value: string, i18n: I18n) => {
    switch (field) {
        case 'region':
            return getTranslationWithFallback(i18n, `countryOrRegion.${value}` as TranslationKey, value);
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
            return 'IBAN' as TranslationKey; // [TODO]: Verify if "IBAN" can and should be translated
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
