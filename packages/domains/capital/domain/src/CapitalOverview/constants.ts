import { BaseEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { ActionConfigs } from './types';

export const GRANT_ACTION_CONFIGS: ActionConfigs = {
    signToS: {
        buttonLabelKey: 'capital.overview.grantItem.actions.signTOS',
        eventLabel: 'Open ToS',
        successButtonLabelKey: 'capital.overview.grantItem.actions.signTOSSuccess',
    },
    AnaCredit: {
        buttonLabelKey: 'capital.overview.grantItem.actions.submitInformation',
        eventLabel: 'Open AnaCredit information',
        successButtonLabelKey: 'capital.overview.grantItem.actions.submitInformationSuccess',
    },
};

export const sharedCapitalOverviewAnalyticsEventProperties = {
    componentName: 'capitalOverview' satisfies BaseEventProperties['componentName'],
    category: 'Capital overview component',
} as const;
