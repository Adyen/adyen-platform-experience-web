import CURRENCY_CODES from '../../../../../../core/Localization/constants/currency-codes';

export const invisibleFields = ['currency', 'deliveryDate', 'emailSender', 'shopperLocale'];

export const shopperFields = {
    shopperReference: { copiable: true },
    fullName: { copiable: true },
    emailAddress: { copiable: true },
    phoneNumber: { copiable: true },
    countryCode: { copiable: false },
    shippingAddress: { copiable: true },
    billingAddress: { copiable: true },
};

export const customRenders = {
    amountValue: (value: number, currency: string) => `${CURRENCY_CODES[currency as keyof typeof CURRENCY_CODES]} ${value}`,
};
