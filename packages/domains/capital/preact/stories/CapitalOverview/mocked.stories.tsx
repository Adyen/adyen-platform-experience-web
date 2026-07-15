import { getMySessionToken, ElementProps, ElementStory, SetupControls } from '@integration-components/testing/storybook-helpers';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../src';
import { AdyenPlatformExperience } from '@integration-components/sdk-internal';
import { ILegalEntity } from '@integration-components/types';
import { CapitalOverviewWithSetupMeta } from './meta';
import { capitalOverviewHandlers } from '../../../mocks/mock-server/capitalOverviewHandlers';
import { useEffect } from 'preact/compat';

const meta: Meta<ElementProps<typeof CapitalOverview> & SetupControls> = {
    ...CapitalOverviewWithSetupMeta,
    title: 'Mocked/Capital/Capital Overview',
};

export const UnsupportedRegion: ElementStory<typeof CapitalOverview, { mountIfInUnsupportedRegion: boolean; legalEntity: ILegalEntity }> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfInUnsupportedRegion: true,
        legalEntity: {
            countryCode: 'TR',
            regions: [{ type: 'capital', value: 'Middle East' }],
        },
    },
    decorators: [
        (story, context) => {
            useEffect(() => {
                const getAdyenPlatformExperienceComponent = async () => {
                    const core = await AdyenPlatformExperience({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const Unqualified: ElementStory<typeof CapitalOverview, { mountIfUnqualified: boolean }> = {
    name: 'Unqualified',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfUnqualified: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.unqualified,
        },
    },
    decorators: [
        (story, context) => {
            useEffect(() => {
                const getAdyenPlatformExperienceComponent = async () => {
                    const core = await AdyenPlatformExperience({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onSessionCreate: getMySessionToken as any,
                    });
                    const capitalOverview = new CapitalOverview({ core });
                    const { state } = await capitalOverview.getState();

                    if (state !== 'isUnqualified' || context.args.mountIfUnqualified) {
                        capitalOverview.mount('#capital-overview');
                    }
                };
                void getAdyenPlatformExperienceComponent();
            }, [context.args.mountIfUnqualified]);

            return <div className="component-wrapper" id="capital-overview"></div>;
        },
    ],
};

export const Prequalified: ElementStory<typeof CapitalOverview> = {
    name: 'Prequalified',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.prequalified,
        },
    },
};

export const GrantPending: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Pending',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantPending,
    },
};

export const GrantMultipleActionsEmbedded: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Multiple actions - Embedded',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantMultipleActionsEmbedded,
    },
};

export const GrantMultipleActionsHosted: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Multiple actions - Hosted',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantMultipleActionsHosted,
    },
};

export const GrantSingleActionEmbedded: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Single action - Embedded',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantSingleActionEmbedded,
    },
};

export const GrantSingleActionHosted: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Single action - Hosted',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantSingleActionHosted,
    },
};

export const GrantActive: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Active',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantActive,
    },
};

export const RepaymentNL: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment - NL',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentNL,
    },
};

export const RepaymentGB: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment - GB',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentGB,
    },
};

export const RepaymentUS: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment - US',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentUS,
    },
};

export const RepaymentNoTransferInstruments: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment - No transfer instruments',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentNoTransferInstruments,
    },
};

export const GrantFailed: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Failed',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantFailed,
    },
};

export const GrantRepaid: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Repaid',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantRepaid,
    },
};

export const GrantRevoked: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Revoked',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantRevoked,
    },
};

export const GrantWrittenOff: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Written off',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grantWrittenOff,
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

export const NewOffer: ElementStory<typeof CapitalOverview> = {
    name: 'New offer',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.newOffer,
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

export const ErrorStateNoOfferCapability: ElementStory<typeof CapitalOverview> = {
    name: 'Error - State - No offer capability',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorStateNoOfferCapability,
        },
    },
};

export const ErrorStateInactiveAccountHolder: ElementStory<typeof CapitalOverview> = {
    name: 'Error - State - Inactive account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorStateInactiveAccountHolder,
        },
    },
};

export const ErrorActionsEmbedded: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Actions Embedded',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorActionsEmbedded,
        },
    },
};

export const ErrorActionsHosted: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Actions Hosted',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorActionsHosted,
        },
    },
};

export default meta;
