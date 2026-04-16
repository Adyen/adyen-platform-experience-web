import { BaseEventProperties } from '../../../core/Analytics/analytics/user-events';
import { ActionConfigs } from './types';

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

export const GRANT_ACTION_CONFIGS: ActionConfigs = {
    signToS: {
        buttonLabelKey: 'capital.overview.grants.item.actions.viewTermsAndConditions',
        eventLabel: 'Go to terms & conditions button clicked',
        successButtonLabelKey: 'capital.overview.grants.item.actions.viewTermsAndConditionsSuccess',
    },
    AnaCredit: {
        buttonLabelKey: 'capital.overview.grants.item.actions.submitInformation',
        eventLabel: 'Submit information for AnaCredit button',
        successButtonLabelKey: 'capital.overview.grants.item.actions.submitInformationSuccess',
    },
};
