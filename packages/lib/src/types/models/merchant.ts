export interface IMerchant {
    mcc: string;
    merchantId: string;
    nameLocation: {
        city: string;
        country: string;
        countryOfOrigin: string;
        name: string;
        rawData: string;
        state: string;
    };
    postalCode: string;
}
