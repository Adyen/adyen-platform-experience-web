export const sharedCapitalOfferAnalyticsEventProperties = {
    componentName: 'capitalOffer',
    category: 'Capital offer component',
    subCategory: 'Capital offer',
} as const;

export const sharedCapitalOfferSelectionAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing offer',
} as const;

export const sharedCapitalOfferSummaryAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing summary',
} as const;
