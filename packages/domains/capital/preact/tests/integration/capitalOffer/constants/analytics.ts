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

export const landedOnPageAnalyticsEventProperties = { ...sharedCapitalOfferAnalyticsEventProperties, label: 'Capital offer' } as const;

export const sliderChangedAnalyticsEventProperties = {
    ...sharedCapitalOfferSelectionAnalyticsEventProperties,
    label: 'Slider changed',
    currency: 'EUR',
    value: 1250000,
    valuePercentage: 48,
    min: 100000,
    max: 2500000,
    relativeToDefault: 'Equal',
};

export const selectedRepaymentTermAnalyticsEventProperties = {
    ...sharedCapitalOfferSelectionAnalyticsEventProperties,
    allTerms: [90, 180, 360],
    availableRates: [800, 1100, 1500],
    availableTerms: [90, 180, 360],
    relativeToDefault: 'Equal',
    selectedRate: 1100,
    selectedTerm: 180,
};
