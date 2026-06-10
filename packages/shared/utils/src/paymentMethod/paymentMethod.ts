import type { IPaymentMethod } from '@integration-components/types';
import { EMPTY_OBJECT } from '../value/constants';

const PAYMENT_METHODS: Record<string, string> = Object.freeze({
    klarna: 'Klarna',
    paypal: 'PayPal',
    klarna_paynow: 'Klarna Pay Now',
});

export const parsePaymentMethodType = (paymentMethod: NonNullable<IPaymentMethod>, format?: 'detail' | 'fourDigit') => {
    const { lastFourDigits, description, type } = paymentMethod ?? EMPTY_OBJECT;
    if (lastFourDigits) return format === 'detail' ? `•••• •••• •••• ${lastFourDigits}` : lastFourDigits;
    return description || PAYMENT_METHODS[type] || type;
};
