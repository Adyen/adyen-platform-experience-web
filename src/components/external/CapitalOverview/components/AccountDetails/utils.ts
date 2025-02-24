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
        case 'region':
            return false;
        default:
            return true;
    }
};

export const getAccountFieldTextToCopy = (field: BankAccountField, value: string): string | undefined => {
    return isCopyableAccountField(field) ? value : undefined;
};

export const getAccountFieldFormattedValue = (field: BankAccountField, value: string, i18n: I18n) => {
    switch (field) {
        case 'iban':
            return getHumanReadableIban(value);
        case 'region': {
            const translationKey = `countryOrRegion.${value}` as TranslationKey;
            const translatedValue = i18n.get(translationKey);
            return translatedValue && translatedValue !== translationKey ? translatedValue : value;
        }
        default:
            return value;
    }
};

export const getAccountFieldTranslationKey = (field: BankAccountField): TranslationKey => {
    switch (field) {
        case 'iban':
            // [TODO]: Verify if "IBAN" can and should be translated
            return 'IBAN' as TranslationKey;
        case 'accountNumber':
            return 'capital.bankAccountNumber';
        case 'routingNumber':
            return 'capital.bankRoutingNumber';
        case 'sortCode':
            return 'capital.bankSortCode';
        case 'region':
            return 'capital.bankCountryOrRegion';
        default:
            return field as TranslationKey;
    }
};
