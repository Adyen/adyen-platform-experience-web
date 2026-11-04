import { IOnboardingConfiguration } from '@integration-components/types';
export * from './capitalState';
export * from './grants';

export const SIGN_TOS_ACTION_DETAILS = {
    url: 'https://www.adyen.com/',
};

export const ANACREDIT_ACTION_DETAILS = {
    url: 'https://www.adyen.com/capital',
};

export const ONBOARDING_CONFIGURATION: IOnboardingConfiguration = {
    token: 'test-onboarding-token',
    legalEntityId: 'test-legal-entity-id',
};
