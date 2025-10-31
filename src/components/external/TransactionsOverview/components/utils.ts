import { ITransaction } from '../../../../types';

const PAYMENT_METHODS = Object.freeze({
    klarna: 'Klarna',
    paypal: 'PayPal',
    klarna_paynow: 'Klarna Pay Now',
});

export function parsePaymentMethodType(paymentMethod: NonNullable<ITransaction['paymentMethod']>, format?: 'detail' | 'fourDigit') {
    if (paymentMethod.lastFourDigits) return format === 'detail' ? '•••• •••• •••• ' + paymentMethod.lastFourDigits : paymentMethod.lastFourDigits;

    return paymentMethod.description || PAYMENT_METHODS[paymentMethod.type as keyof typeof PAYMENT_METHODS] || paymentMethod.type;
}
