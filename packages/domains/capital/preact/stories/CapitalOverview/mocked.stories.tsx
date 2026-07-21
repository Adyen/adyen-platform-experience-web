import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, getMySessionToken } from '@integration-components/testing/storybook-helpers';
import { CapitalOverview } from '../../src';
import { AdyenPlatformExperience } from '@integration-components/sdk-internal';
import { CapitalOverviewMeta } from './meta';
import { capitalOverviewHandlers } from '../../../mocks/mock-server';
import { useEffect } from 'preact/compat';

const meta: Meta<ElementProps<typeof CapitalOverview>> = {
    ...CapitalOverviewMeta,
    title: 'Mocked/Capital/Capital Overview',
};

export const UnsupportedRegion: ElementStory<typeof CapitalOverview, { mountIfInUnsupportedRegion: boolean }> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfInUnsupportedRegion: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.unsupportedRegion,
        },
    },
    decorators: [
        (story, context) => {
            useEffect(() => {
                const getAdyenPlatformExperienceComponent = async () => {
                    const core = await AdyenPlatformExperience({
                        onSessionCreate: getMySessionToken as any,
                    });
                    const capitalOverview = new CapitalOverview({ core });
                    const { state } = await capitalOverview.getState();

                    if (state !== 'isInUnsupportedRegion' || context.args.mountIfInUnsupportedRegion) {
                        capitalOverview.mount('#capital-overview');
                    }
                };
                void getAdyenPlatformExperienceComponent();
            }, [context.args.mountIfInUnsupportedRegion]);

            return <div className="component-wrapper" id="capital-overview"></div>;
        },
    ],
};

export const Ineligible: ElementStory<typeof CapitalOverview, { mountIfIneligible: boolean }> = {
    name: 'Ineligible',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfIneligible: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.ineligible,
        },
    },
    decorators: [
        (story, context) => {
            useEffect(() => {
                const getAdyenPlatformExperienceComponent = async () => {
                    const core = await AdyenPlatformExperience({
                        onSessionCreate: getMySessionToken as any,
                    });
                    const capitalOverview = new CapitalOverview({ core });
                    const { state } = await capitalOverview.getState();

                    if (state !== 'isUnqualified' || context.args.mountIfIneligible) {
                        capitalOverview.mount('#capital-overview');
                    }
                };
                void getAdyenPlatformExperienceComponent();
            }, [context.args.mountIfIneligible]);

            return <div className="component-wrapper" id="capital-overview"></div>;
        },
    ],
};

export const FirstTimeEligible: ElementStory<typeof CapitalOverview> = {
    name: 'First-time eligible',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.firstTimeEligible,
        },
    },
};

export const EarlyRenewal: ElementStory<typeof CapitalOverview> = {
    name: 'Early renewal',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.earlyRenewal,
    },
};

export const Eligible: ElementStory<typeof CapitalOverview> = {
    name: 'Eligible',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.eligible,
    },
};

export const Grants: ElementStory<typeof CapitalOverview> = {
    name: 'Grants',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grants,
    },
};

export const Pending: ElementStory<typeof CapitalOverview> = {
    name: 'Pending',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.pending,
    },
};

export const MultipleActions: ElementStory<typeof CapitalOverview> = {
    name: 'Multiple actions',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.multipleActions,
    },
};

export const SingleAction: ElementStory<typeof CapitalOverview> = {
    name: 'Single action',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.singleAction,
    },
};

export const MultipleHostedActions: ElementStory<typeof CapitalOverview> = {
    name: 'Multiple hosted actions',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.multipleHostedActions,
    },
};

export const SingleHostedAction: ElementStory<typeof CapitalOverview> = {
    name: 'Single hosted action',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.singleHostedAction,
    },
};

export const RepaymentNL: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment NL',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentNL,
    },
};

export const RepaymentGB: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment GB',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentGB,
    },
};

export const RepaymentUS: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment US',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentUS,
    },
};

export const RepaymentWithoutTransferInstruments: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment without transfer instruments',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentWithoutTransferInstruments,
    },
};

export const ErrorOfferConfig: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Offer config',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorOfferConfig,
        },
    },
};

export const ErrorAccountHolder: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorAccountHolder,
        },
    },
};

export const ErrorOnboardingConfig: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Onboarding config',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorOnboardingConfig,
        },
    },
};

export const ErrorHostedAction: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Hosted action',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorHostedAction,
        },
    },
};

export default meta;
