import { BaseEventProperties } from '../../../../core/Analytics/analytics/user-events';

export const CAPITAL_OVERVIEW_CLASS_NAMES = {
    base: 'adyen-pe-capital-overview',
    title: 'adyen-pe-capital-overview__title',
    skeleton: 'adyen-pe-capital-overview__skeleton',
    headerSkeleton: 'adyen-pe-capital-overview__header-skeleton',
    skeletonContainer: 'adyen-pe-capital-overview__header-skeleton-container',
    preQualifiedGrant: 'adyen-pe-capital-overview__pre-qualified-grant',
    preQualifiedGrantButton: 'adyen-pe-capital-overview__pre-qualified-grant-review-button',
    errorContainer: 'adyen-pe-capital-overview__error-container',
};

export const sharedCapitalOverviewAnalyticsEventProperties = {
    componentName: 'capitalOverview' satisfies BaseEventProperties['componentName'],
    category: 'Capital overview component',
} as const;
