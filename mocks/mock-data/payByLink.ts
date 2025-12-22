export const STORES = [
    {
        description: 'Main Store - New York',
        storeCode: 'New York Store',
        storeId: 'NY001',
    },
    {
        description: 'Main Store - London',
        storeCode: 'London Store',
        storeId: 'LD001',
    },
    {
        description: 'Main Store - Amsterdam',
        storeCode: 'Amsterdam Store',
        storeId: 'AM001',
    },
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];

export const COUNTRIES = [
    {
        countryCode: 'AF',
        countryName: 'Afghanistan',
    },
    {
        countryCode: 'AL',
        countryName: 'Albania',
    },
    {
        countryCode: 'DZ',
        countryName: 'Algeria',
    },
    {
        countryCode: 'AR',
        countryName: 'Argentina',
    },
    {
        countryCode: 'AU',
        countryName: 'Australia',
    },
    {
        countryCode: 'AT',
        countryName: 'Austria',
    },
    {
        countryCode: 'BE',
        countryName: 'Belgium',
    },
    {
        countryCode: 'BR',
        countryName: 'Brazil',
    },
    {
        countryCode: 'CA',
        countryName: 'Canada',
    },
    {
        countryCode: 'CN',
        countryName: 'China',
    },
    {
        countryCode: 'FR',
        countryName: 'France',
    },
    {
        countryCode: 'DE',
        countryName: 'Germany',
    },
    {
        countryCode: 'IN',
        countryName: 'India',
    },
    {
        countryCode: 'IT',
        countryName: 'Italy',
    },
    {
        countryCode: 'JP',
        countryName: 'Japan',
    },
    {
        countryCode: 'MX',
        countryName: 'Mexico',
    },
    {
        countryCode: 'NL',
        countryName: 'Netherlands',
    },
    {
        countryCode: 'ES',
        countryName: 'Spain',
    },
    {
        countryCode: 'GB',
        countryName: 'United Kingdom',
    },
    {
        countryCode: 'US',
        countryName: 'United States',
    },
];

export const INSTALLMENTS = [
    {
        countryCode: 'BR',
        installments: [3, 6, 9, 12],
    },
    {
        countryCode: 'MX',
        installments: [3, 6, 9, 12, 18],
    },
    {
        countryCode: 'TR',
        installments: [2, 3, 6, 9],
    },
];

const BASE_PAY_BY_LINK_CONFIGURATION = {
    amountValue: {
        required: true,
    },
    billingAddress: {
        required: true,
    },
    countryCode: {
        required: true,
        options: ['ES', 'US'],
    },
    currency: {
        required: true,
        options: CURRENCIES,
    },
    deliveryDate: {
        required: false,
    },
    description: {
        required: true,
    },
    emailAddress: {
        required: true,
    },
    shopperName: {
        required: false,
    },
    linkType: {
        required: true,
        options: ['singleUse', 'open'],
    },
    linkValidity: {
        required: true,
        options: [
            {
                durationUnit: 'hour',
                quantity: 24,
                type: 'fixed',
            },
            {
                durationUnit: 'day',
                quantity: 30,
                type: 'fixed',
            },
            {
                durationUnit: 'week',
                quantity: 1,
                type: 'fixed',
            },
            {
                type: 'flexible',
            },
        ],
    },
    merchantReference: {
        required: true,
    },
    phoneNumber: {
        required: true,
    },
    deliveryAddress: {
        required: true,
    },
    sendLinkToShopper: {
        required: true,
    },
    sendPaymentSuccessToShopper: {
        required: true,
    },
    shopperLocale: {
        required: true,
        options: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'nl-NL', 'pt-BR', 'ja-JP', 'zh-CN'],
    },
    shopperReference: {
        required: true,
    },
};

const { linkValidity, deliveryAddress, ...configWithoutLinkValidityAndAddress } = BASE_PAY_BY_LINK_CONFIGURATION;

export const PAY_BY_LINK_CONFIGURATION = {
    NY001: BASE_PAY_BY_LINK_CONFIGURATION,
    LD001: configWithoutLinkValidityAndAddress,
    AM001: BASE_PAY_BY_LINK_CONFIGURATION,
};

export const PAY_BY_LINK_SETTINGS = {
    NY001: {
        termsOfServiceUrl: 'https://example.com/terms-and-conditions',
    },
    LD001: { termsOfServiceUrl: 'https://example.com/terms-and-conditions' },
    AM001: {},
};
