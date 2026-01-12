import getMySessionToken from '../../utils/sessionRequest';
import { ElementProps, ElementStory, SetupControls } from '../../utils/types';
import { Meta } from '@storybook/preact';
import { AdyenPlatformExperience, CapitalOverview, ILegalEntity } from '../../../src';
import { CapitalOverviewWithSetupMeta } from '../../components/Capital/capitalOverview';
import { CapitalOverviewMockedResponses } from '../../../mocks/mock-server/capital';
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
                        onSessionCreate: getMySessionToken,
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
            handlers: CapitalOverviewMockedResponses.unqualified,
        },
    },
    decorators: [
        (story, context) => {
            useEffect(() => {
                const getAdyenPlatformExperienceComponent = async () => {
                    const core = await AdyenPlatformExperience({
                        onSessionCreate: getMySessionToken,
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
            handlers: CapitalOverviewMockedResponses.prequalified,
        },
    },
};

export const GrantPending: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Pending',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantPending,
    },
};

export const GrantMissingActionSignTOS: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Missing Action Sign TOS',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.signTOS,
    },
};

export const GrantMissingActionAnacredit: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Missing Action Anacredit',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.anacredit,
    },
};

export const GrantMultipleActions: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Multiple missing actions',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantActions,
    },
};

export const GrantActive: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Active',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantActive,
    },
};

export const RepaymentNL: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment - NL',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.repaymentNL,
    },
};

export const RepaymentGB: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment - GB',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.repaymentGB,
    },
};

export const RepaymentUS: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment - US',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.repaymentUS,
    },
};

export const RepaymentNoTransferInstruments: ElementStory<typeof CapitalOverview> = {
    name: 'Repayment - No transfer instruments',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.repaymentNoTransferInstruments,
    },
};

export const GrantFailed: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Failed',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantFailed,
    },
};

export const GrantRepaid: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Repaid',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantRepaid,
    },
};

export const GrantRevoked: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Revoked',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantRevoked,
    },
};

export const GrantWrittenOff: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Written off',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantWrittenOff,
    },
};

export const NewOffer: ElementStory<typeof CapitalOverview> = {
    name: 'New offer',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.newOffer,
    },
};

export const Grants: ElementStory<typeof CapitalOverview> = {
    name: 'Grants',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grants,
    },
};

export const ErrorDynamicOfferConfigNoCapability: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Dynamic offer config - No capability',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOverviewMockedResponses.errorDynamicOfferConfigNoCapability,
        },
    },
};

export const ErrorDynamicOfferConfigInactiveAccountHolder: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Dynamic offer config - Inactive account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOverviewMockedResponses.errorDynamicOfferConfigInactiveAccountHolder,
        },
    },
};

export const ErrorMissingActionsGeneric: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Missing actions - Generic',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOverviewMockedResponses.errorMissingActionsGeneric,
        },
    },
};

export default meta;
