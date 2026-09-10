import { BaseEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { ActionConfigs } from './types';

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

export const GRANT_ADJUSTMENT_DETAILS = {
    revocation: 'revocation',
    unscheduledRepayment: 'unscheduledRepayment',
} as const;
