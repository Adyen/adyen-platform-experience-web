import { BaseEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { ActionConfigs } from './types';

export const GRANT_ACTION_CONFIGS: ActionConfigs = {
    signToS: {
        buttonLabelKey: 'capital.overview.grantItem.signTOS.label',
        eventLabel: 'Open ToS',
        successButtonLabelKey: 'capital.overview.grantItem.signTOS.success',
    },
    AnaCredit: {
        buttonLabelKey: 'capital.overview.grantItem.submitInformation.label',
        eventLabel: 'Open AnaCredit information',
        successButtonLabelKey: 'capital.overview.grantItem.submitInformation.success',
    },
};

export const sharedCapitalOverviewAnalyticsEventProperties = {
    componentName: 'capitalOverview' satisfies BaseEventProperties['componentName'],
    category: 'Capital overview component',
} as const;
