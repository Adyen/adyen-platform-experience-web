export const STORES = [
    {
        description: 'Main Store - New York',
        storeCode: 'NY001',
        storeId: 'STORE_NY_001',
    },
    {
        description: 'Main Store - London',
        storeCode: 'LN001',
        storeId: 'STORE_LON_001',
    },
    {
        description: 'Main Store - Amsterdam',
        storeCode: 'AM001',
        storeId: 'STORE_AMS_001',
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
    deliveryAddress: {
        required: false,
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
    STORE_NY_001: BASE_PAY_BY_LINK_CONFIGURATION,
    STORE_LON_001: configWithoutLinkValidityAndAddress,
    STORE_AMS_001: BASE_PAY_BY_LINK_CONFIGURATION,
};

export const PAY_BY_LINK_SETTINGS = {
    STORE_NY_001: {
        termsOfServiceUrl: 'https://example.com/terms-and-conditions',
    },
    STORE_LON_001: { termsOfServiceUrl: 'https://example.com/terms-and-conditions' },
    STORE_AMS_001: {},
};

export const STORE_THEME = {
    STORE_NY_001: {},
    STORE_LON_001: {
        brandName: 'Adyen London',
        logoUrl:
            'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiYWR5ZW5cL2ZpbGVcLzFGc1Z0alNLVnYzN3FpVTJVVkZ0LnN2ZyJ9:adyen:RAaShqweWtpB-wgUfoAAyM0i53H16yUEh3btcbNlZoI',
    },
    STORE_AMS_001: {
        brandName: 'Adyen Amsterdam',
        logoUrl:
            'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiYWR5ZW5cL2ZpbGVcL2txY3BLSzRhR0djSFhIM3o4WXF0LnN2ZyJ9:adyen:Cv3X5-eZhQecs_MZFmyWHVpc9l1ipIvTGLUJusiOfDA',
        fullWidthLogoUrl:
            'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiYWR5ZW5cL2ZpbGVcL2txY3BLSzRhR0djSFhIM3o4WXF0LnN2ZyJ9:adyen:Cv3X5-eZhQecs_MZFmyWHVpc9l1ipIvTGLUJusiOfDA',
    },
};

export const STORE_SETTINGS = {
    STORE_NY_001: {},
    STORE_LON_001: {
        termsOfServiceUrl:
            'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiYWR5ZW5cL2ZpbGVcLzFGc1Z0alNLVnYzN3FpVTJVVkZ0LnN2ZyJ9:adyen:RAaShqweWtpB-wgUfoAAyM0i53H16yUEh3btcbNlZoI',
    },
    STORE_AMS_001: {
        termsOfServiceUrl:
            'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiYWR5ZW5cL2ZpbGVcL2txY3BLSzRhR0djSFhIM3o4WXF0LnN2ZyJ9:adyen:Cv3X5-eZhQecs_MZFmyWHVpc9l1ipIvTGLUJusiOfDA',
    },
};
