import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, getMySessionToken, SetupControls } from '@integration-components/testing/storybook-helpers';
import { capitalOfferWithSetupMeta } from './meta';
import { CapitalOffer, CapitalOverview } from '../../src';
import { ILegalEntity } from '@integration-components/types';
import { capitalOfferHandlers } from '../../../mocks/mock-server';
import { useEffect } from 'preact/compat';
import { AdyenPlatformExperience } from '../../../../../../src';

const meta: Meta<ElementProps<typeof CapitalOffer> & SetupControls> = { ...capitalOfferWithSetupMeta, title: 'Mocked/Capital/Capital Offer' };

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
                        onSessionCreate: getMySessionToken as any,
                    });
                    const capitalOffer = new CapitalOffer({ core, onFundsRequest: () => undefined });
                    const { state } = await capitalOffer.getState();

                    if (state !== 'isInUnsupportedRegion' || context.args.mountIfInUnsupportedRegion) {
                        capitalOffer.mount('#capital-overview');
                    }
                };
                void getAdyenPlatformExperienceComponent();
            }, [context.args.mountIfInUnsupportedRegion]);

            return <div className="component-wrapper" id="capital-overview"></div>;
        },
    ],
};

export const Ineligible: ElementStory<typeof CapitalOffer, { mountIfIneligible: boolean }> = {
    name: 'Ineligible',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfIneligible: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.ineligible,
        },
    },
    decorators: [
        (story, context) => {
            useEffect(() => {
                const getAdyenPlatformExperienceComponent = async () => {
                    const core = await AdyenPlatformExperience({
                        onSessionCreate: getMySessionToken as any,
                    });
                    const capitalOffer = new CapitalOffer({
                        core,
                        onFundsRequest: () => undefined,
                        onContactSupport: context.args.onContactSupport,
                    });
                    const { state } = await capitalOffer.getState();

                    if (state !== 'isUnqualified' || context.args.mountIfIneligible) {
                        capitalOffer.mount('#capital-overview');
                    }
                };
                void getAdyenPlatformExperienceComponent();
            }, [context.args.mountIfIneligible, context.args.onContactSupport]);

            return <div className="component-wrapper" id="capital-overview"></div>;
        },
    ],
};

export const Eligible: ElementStory<typeof CapitalOffer> = {
    name: 'Eligible',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligible,
        },
    },
};

export const EligibleWithOngoingGrants: ElementStory<typeof CapitalOffer> = {
    name: 'Eligible with ongoing grants',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleWithOngoingGrants,
        },
    },
};

export const EarlyRenewal: ElementStory<typeof CapitalOffer> = {
    name: 'Early renewal',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.earlyRenewal,
        },
    },
};

export const APR: ElementStory<typeof CapitalOffer, { legalEntity: ILegalEntity }> = {
    name: 'APR',
    args: {
        mockedApi: true,
        legalEntity: {
            countryCode: 'CA',
            regions: [],
        },
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.apr,
        },
    },
};

export const ErrorOfferConfig: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Offer config',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorOfferConfig,
        },
    },
};

export const ErrorAccountHolder: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorAccountHolder,
        },
    },
};

export const ErrorOffer: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Offer',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorOffer,
        },
    },
};

export const ErrorTemporaryOffer: ElementStory<typeof CapitalOffer> = {
    name: 'Error (temporary) - Offer',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorTemporaryOffer,
        },
    },
};

export const ErrorReview: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Review',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorReview,
        },
    },
};

export const ErrorSubmit: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Submit',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorSubmit,
        },
    },
};

export const ErrorWithCodeSubmit: ElementStory<typeof CapitalOffer> = {
    name: 'Error (with code) - Submit',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorWithCodeSubmit,
        },
    },
};

export const ErrorBalanceAccount: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Balance account',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorBalanceAccount,
        },
    },
};

export default meta;
