export {
    sharedCapitalOfferAnalyticsEventProperties,
    sharedCapitalOfferSelectionAnalyticsEventProperties,
    sharedCapitalOfferSummaryAnalyticsEventProperties,
} from '../../../fixtures/CapitalOffer/constants/analytics';

export const sharedCapitalOverviewAnalyticsEventProperties = {
    componentName: 'capitalOverview',
    category: 'Capital overview component',
    subCategory: 'Grants overview',
    label: 'Capital overview',
} as const;

export const sharedActionAnalyticsEventProps = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    category: 'Missing action modal',
};

export const sharedSendRepaymentButtonAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Grant active',
    label: 'Send repayment',
} as const;
