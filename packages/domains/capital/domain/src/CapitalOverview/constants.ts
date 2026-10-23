import { BaseEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { ActionConfigs } from './types';

export const GRANT_ACTION_CONFIGS: ActionConfigs = {
    signToS: {
        buttonLabelKey: 'capital.overview.grants.viewTermsAndConditions.label',
        eventLabel: 'Open ToS',
        successButtonLabelKey: 'capital.overview.grants.viewTermsAndConditions.success',
    },
    AnaCredit: {
        buttonLabelKey: 'capital.overview.grants.submitInformation.label',
        eventLabel: 'Open AnaCredit information',
        successButtonLabelKey: 'capital.overview.grants.submitInformation.success',
    },
};

export const sharedCapitalOverviewAnalyticsEventProperties = {
    componentName: 'capitalOverview' satisfies BaseEventProperties['componentName'],
    category: 'Capital overview component',
} as const;
