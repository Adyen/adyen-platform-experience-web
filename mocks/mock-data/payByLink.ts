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

export const PAY_BY_LINK_CONFIGURATION = {
    amountValue: {
        fillMode: 'optional',
    },
    billingAddress: {
        fillMode: 'employeeOptional',
    },
    countryCode: {
        fillMode: 'optional',
        optionsMode: 'all',
    },
    currency: {
        fillMode: 'USD',
        optionsMode: 'all',
    },
    deliveryDate: {
        fillMode: 'optional',
    },
    description: {
        fillMode: 'optional',
    },
    emailAddress: {
        fillMode: 'employeeOptional',
    },
    emailSender: {
        fillMode: 'optional',
    },
    fullName: {
        fillMode: 'employeeOptional',
    },
    linkType: {
        fillMode: 'optional',
        optionsMode: 'all',
    },
    linkValidity: {
        fillMode: 'optional',
        optionsMode: 'all',
        subset: [
            {
                durationUnit: 'days',
                quantity: 7,
            },
            {
                durationUnit: 'days',
                quantity: 30,
            },
        ],
    },
    merchantReference: {
        fillMode: 'optional',
    },
    phoneNumber: {
        fillMode: 'employeeOptional',
    },
    shippingAddress: {
        fillMode: 'employeeOptional',
    },
    shopperLocale: {
        fillMode: 'optional',
        optionsMode: 'all',
    },
    shopperReference: {
        fillMode: 'optional',
    },
    stores: {
        fillMode: 'optional',
    },
};

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
