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
    fundsCapturedAmount: 'fundsCaptured',
    payoutAmount: 'netPayout',
    adjustmentAmount: 'adjustments',
    dateAndPaymentMethod: 'date',
    name: 'report',
    file: 'file',
} as const;

export const getLabel = (key: keyof typeof labels) => {
    return labels[key] || key;
};
