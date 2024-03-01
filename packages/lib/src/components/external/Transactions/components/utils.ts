import { ITransaction } from '../../../../types';

const labels = {
    id: 'paymentId',
    type: 'type',
    creationDate: 'date',
    balanceAccountId: 'balanceAccount',
    accountHolderId: 'account',
    fee: 'txType.Fee',
    capture: 'txType.capture',
    leftover: 'txType.leftover',
    manualCorrection: 'txType.manualCorrection',
    internalTransfer: 'txType.internalTransfer',
    balanceAdjustment: 'txType.balanceAdjustment',
    amount: 'txAmount',
    description: 'description',
    status: 'status',
    category: 'category',
    paymentMethod: 'paymentMethod',
    currency: 'currency',
} as const;

export const getLabel = (key: keyof typeof labels) => {
    return labels[key] || key;
};

const PAYMENT_METHODS = Object.freeze({
    klarna: 'Klarna',
    paypal: 'PayPal',
});

export function parsePaymentMethodType(paymentMethod: NonNullable<ITransaction['paymentMethod']>) {
    if (paymentMethod.lastFourDigits) return paymentMethod.lastFourDigits;

    return PAYMENT_METHODS[paymentMethod.type as keyof typeof PAYMENT_METHODS] || paymentMethod.type;
}
