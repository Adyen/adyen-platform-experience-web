const labels = {
    id: 'paymentId',
    transactionType: 'transactionType',
    creationDate: 'date', //TODO: when backend changes this field, rename it as createdAt
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
    grossPayout: 'grossPayout',
    netPayout: 'netPayout',
    adjustments: 'adjustments',
} as const;

export const getLabel = (key: keyof typeof labels) => {
    return labels[key] || key;
};
