export {
    sharedCapitalOfferAnalyticsEventProperties,
    sharedCapitalOfferSelectionAnalyticsEventProperties,
    sharedCapitalOfferSummaryAnalyticsEventProperties,
} from '../../capitalOffer/constants/analytics';

const sharedCapitalOverviewAnalyticsEventProperties = {
    componentName: 'capitalOverview',
    category: 'Capital overview component',
    subCategory: 'Grants overview',
    label: 'Capital overview',
} as const;

export const sharedGrantsOverviewAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Grants overview',
} as const;

export const sharedPrequalifiedAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Prequalified',
} as const;

export const sharedSendRepaymentButtonAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Grant active',
    label: 'Send repayment',
} as const;
