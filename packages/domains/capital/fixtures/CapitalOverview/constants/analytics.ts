export {
    sharedCapitalOfferAnalyticsEventProperties,
    sharedCapitalOfferSelectionAnalyticsEventProperties,
    sharedCapitalOfferSummaryAnalyticsEventProperties,
} from '../../../fixtures/CapitalOffer/constants/analytics';

export const sharedCapitalOverviewAnalyticsEventProperties = {
    componentName: 'capitalOverview',
    category: 'Capital overview component',
    subCategory: 'Grants overview',
} as const;

export const sharedGrantItemAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Grant item',
} as const;

export const openRepaymentButtonAnalyticsEventProperties = {
    ...sharedGrantItemAnalyticsEventProperties,
    label: 'Open repayment',
} as const;

export const dismissRepaymentAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Repayment',
    label: 'Dismiss repayment',
} as const;
