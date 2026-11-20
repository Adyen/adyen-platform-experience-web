import type Localization from '@integration-components/core/Localization';
import type { IPaymentLinkType } from '@integration-components/types';
import type { PayByLinkTranslationKey } from '../shared/types';

export interface SummaryValueContext {
    i18n: Localization['i18n'];
    values: Record<string, unknown>;
    displayValues: Record<string, string>;
    countries?: { id: string; name: string }[];
}

const COUNTRY_FIELDS = ['countryCode', 'deliveryAddress.country', 'billingAddress.country'];

const stringify = (value: unknown) => (value === undefined || value === null ? '' : `${value}`);

export const getSummaryFieldValue = (fieldName: string, { i18n, values, displayValues, countries }: SummaryValueContext): string => {
    const value = values[fieldName];
    const display = displayValues[fieldName];

    if (fieldName === 'linkValidity.quantity') {
        const unit = values['linkValidity.durationUnit'];
        if (!value || !unit) return '';
        return i18n.get(`payByLink.creation.validity.linkValidityUnit.${unit}` as PayByLinkTranslationKey, {
            values: { quantity: value },
            count: Number(value),
        });
    }

    if (fieldName === 'amount.value') {
        const currency = values['amount.currency'] as string | undefined;
        if (value == null || value === '' || !currency) return '';
        return i18n.amount(Number(value), currency);
    }

    if (fieldName === 'linkType') {
        return value ? i18n.get(`payByLink.creation.linkTypes.${value as IPaymentLinkType}`) : '';
    }

    if (COUNTRY_FIELDS.includes(fieldName)) {
        return countries?.find(country => country.id === value)?.name ?? display ?? stringify(value);
    }

    return display ?? stringify(value);
};
