const labels = {
    id: 'paymentId',
    transactionType: 'transactionType',
    createdAt: 'date',
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
    grossAmount: 'grossPayout',
    netAmount: 'netPayout',
    chargesAmount: 'adjustments',
} as const;

export const getLabel = (key: keyof typeof labels) => {
    return labels[key] || key;
};
