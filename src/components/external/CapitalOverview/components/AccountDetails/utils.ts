import useCoreContext from '../../../../../core/Context/useCoreContext';
import { AccountDetailProps } from './AccountDetail';
import { TranslationKey } from '../../../../../translations';
import { EMPTY_OBJECT } from '../../../../../utils';

type I18n = ReturnType<typeof useCoreContext>['i18n'];

export const getHumanReadableIban = (iban: string, useNonBreakingSpaces = true) => {
    const spaceSeparator = (useNonBreakingSpaces as any) !== false ? ' ' : ' ';
    const ibanWithoutSpaces = iban.replace(/\s+/g, '');
    return ibanWithoutSpaces.replace(/([A-Z\d]{4}(?!$))/gi, `$1${spaceSeparator}`);
};

const isCopyableAccountField = (field: string, region?: string): boolean => {
    switch (field) {
        case 'bankName':
        case 'region':
            return false;
        default:
            return true;
    }
};

export const getAccountFieldCopyTextConfig = (field: string, value: any, i18n: I18n, region?: string): AccountDetailProps['copyTextConfig'] => {
    if (isCopyableAccountField(field, region)) {
        const formattedValue = getAccountFieldFormattedValue(field, value, i18n, region);
        return formattedValue === value ? EMPTY_OBJECT : { textToCopy: value };
    }
};

export const getAccountFieldFormattedValue = (field: string, value: any, i18n: I18n, region?: string) => {
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

export const getAccountFieldTranslationKey = (field: string, region?: string): TranslationKey => {
    switch (field) {
        case 'iban':
            return 'IBAN' as TranslationKey;
        case 'accountNumber':
            return 'capital.bankAccountNumber';
        case 'routingNumber':
            return 'capital.bankRoutingNumber';
        case 'bankName':
            return 'capital.bankName';
        case 'region':
            return 'capital.bankCountryOrRegion';
        default:
            return field as TranslationKey;
    }
};
