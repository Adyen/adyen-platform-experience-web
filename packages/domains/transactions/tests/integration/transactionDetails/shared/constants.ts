export const sharedAnalyticsEventProperties = {
    componentName: 'transactionDetails',
    category: 'Transaction component',
    subCategory: 'Transaction details',
} as const;

export const sharedCopyButtonAnalyticsEventProperties = {
    ...sharedAnalyticsEventProperties,
    sectionName: 'Details',
    label: 'Copy button',
} as const;
