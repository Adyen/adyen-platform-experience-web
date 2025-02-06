import { ITransaction } from '../../../../types';

const PAYMENT_METHODS = Object.freeze({
    klarna: 'Klarna',
    paypal: 'PayPal',
});

export function parsePaymentMethodType(paymentMethod: NonNullable<ITransaction['paymentMethod']>, format?: 'detail' | 'fourDigit') {
    if (paymentMethod.paymentMethodDescription) return paymentMethod.paymentMethodDescription;

    if (paymentMethod.lastFourDigits) return format === 'detail' ? '•••• •••• •••• ' + paymentMethod.lastFourDigits : paymentMethod.lastFourDigits;

    return PAYMENT_METHODS[paymentMethod.type as keyof typeof PAYMENT_METHODS] || paymentMethod.type;
}
