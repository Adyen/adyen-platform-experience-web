export const STORES = [
    {
        description: 'Main Store - New York',
        storeCode: 'STORE_NY_001',
    },
    {
        description: 'Main Store - London',
        storeCode: 'STORE_LON_001',
    },
    {
        description: 'Main Store - Amsterdam',
        storeCode: 'STORE_AMS_001',
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

export const PAY_BY_LINK_CONFIGURATION = {
    amountValue: {
        required: true,
    },
    billingAddress: {
        required: true,
    },
    countryCode: {
        required: true,
        options: COUNTRIES,
    },
    currency: {
        required: true,
        options: CURRENCIES.map(id => ({ id })),
    },
    deliveryDate: {
        required: true,
    },
    description: {
        required: true,
    },
    emailAddress: {
        required: true,
    },
    emailSender: {
        required: true,
    },
    fullName: {
        required: true,
    },
    linkType: {
        required: true,
        options: ['singleUse', 'open'],
    },
    linkValidity: {
        required: true,
        options: [
            {
                durationUnit: 'day',
                quantity: 7,
                type: 'flexible',
            },
            {
                durationUnit: 'day',
                quantity: 30,
                type: 'flexible',
            },
            {
                durationUnit: 'week',
                quantity: 1,
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
    shippingAddress: {
        required: true,
    },
    shopperLocale: {
        required: true,
        options: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'nl-NL', 'pt-BR', 'ja-JP', 'zh-CN'],
    },
    shopperReference: {
        required: true,
    },
    store: {
        required: true,
    },
};
