const labels = {
    id: 'paymentId',
    transactionType: 'transactionType',
    createdAt: 'date',
    balanceAccountId: 'balanceAccount',
    accountHolderId: 'account',
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
