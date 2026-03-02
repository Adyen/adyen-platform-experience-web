import { sharedTransactionsInsightsAnalyticsEventProperties } from '../../transactionsOverview/shared/constants';

export const sharedAnalyticsEventProperties = {
    ...sharedTransactionsInsightsAnalyticsEventProperties,
    componentName: 'transactionsInsights',
} as const;
