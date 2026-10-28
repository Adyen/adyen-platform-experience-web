import type { PaymentLinkCreationProps } from '@adyen/adyen-platform-experience-web';
import { isOn, optional, type Presets } from '../../playground/controls';
import { logEvent } from '../../playground/events';
import type { ControlValues, TextControl, ToggleControl } from '../../playground/types';

type FieldsConfig = NonNullable<PaymentLinkCreationProps['fieldsConfig']>;

export const storeIdsControl: TextControl = {
    key: 'storeIds',
    label: 'storeIds',
    type: 'text',
    placeholder: 'STORE_ID_1, STORE_ID_2',
    hint: 'Comma-separated store IDs. One ID is passed as a string, several as an array. Empty allows all stores.',
};

export const toStoreIds = (values: ControlValues) => {
    const storeIds = (values.storeIds ?? '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);
    return storeIds.length > 1 ? storeIds : optional(storeIds[0]);
};

const logCreate = (paymentLink: unknown) => logEvent('onCreate()', paymentLink);

export const createControl: ToggleControl = {
    key: 'onCreate',
    label: 'onCreate',
    type: 'toggle',
    hint: 'Called with the submitted values after a link is created.',
};

export const toCreate = (values: ControlValues) => (isOn(values.onCreate) ? logCreate : undefined);

const inOneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

export const FIELDS_DATA_PRESETS: Presets<FieldsConfig['data']> = {
    '': { label: 'None' },
    partial: {
        label: 'Amount and reference',
        value: { amount: { currency: 'EUR', value: 12345 }, reference: 'DEMO-0001' },
    },
    full: {
        label: 'All fields',
        value: {
            amount: { currency: 'EUR', value: 12345 },
            reference: 'DEMO-0001',
            description: 'Integration demo payment link',
            linkType: 'open',
            linkValidity: { durationUnit: 'week', quantity: 3 },
            deliverAt: inOneWeek,
            shopperReference: 'DEMO-SHOPPER',
            shopperEmail: 'shopper@example.com',
            shopperLocale: 'en-US',
            shopperName: { firstName: 'John', lastName: 'Doe' },
            countryCode: 'NL',
            telephoneNumber: '+31 612345678',
            deliveryAddress: { street: 'Simon Carmiggeltstraat', houseNumberOrName: '6-50', postalCode: '1011 DJ', city: 'Amsterdam', country: 'NL' },
            billingAddress: { street: 'Gran Via', houseNumberOrName: '123', postalCode: '28001', city: 'Madrid', country: 'ES' },
        },
    },
};

export const FIELDS_VISIBILITY_PRESETS: Presets<FieldsConfig['visibility']> = {
    '': { label: 'None' },
    amountReadOnly: {
        label: 'Amount and reference read-only',
        value: { amount: 'readOnly', reference: 'readOnly' },
    },
    shopperHidden: {
        label: 'Hide shopper name, phone, locale and delivery date',
        value: { shopperName: 'hidden', telephoneNumber: 'hidden', shopperLocale: 'hidden', deliverAt: 'hidden' },
    },
    allReadOnly: {
        label: 'Everything read-only',
        value: {
            amount: 'readOnly',
            reference: 'readOnly',
            description: 'readOnly',
            linkType: 'readOnly',
            linkValidity: 'readOnly',
            deliverAt: 'readOnly',
            shopperReference: 'readOnly',
            shopperEmail: 'readOnly',
            shopperLocale: 'readOnly',
            shopperName: 'readOnly',
            countryCode: 'readOnly',
            telephoneNumber: 'readOnly',
            deliveryAddress: 'readOnly',
            billingAddress: 'readOnly',
        },
    },
};
