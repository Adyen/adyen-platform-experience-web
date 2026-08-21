import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, getMySessionToken } from '@integration-components/testing/storybook-helpers';
import { capitalOfferMeta } from './meta';
import { CapitalOffer } from '../../src';
import { capitalOfferHandlers } from '../../../mocks/mock-server';
import { useEffect } from 'preact/compat';
import { AdyenPlatformExperience } from '../../../../../../src';

const meta: Meta<ElementProps<typeof CapitalOffer>> = { ...capitalOfferMeta, title: 'Mocked/Capital/Capital Offer' };

export const UnsupportedRegion: ElementStory<typeof CapitalOffer, { mountIfInUnsupportedRegion: boolean }> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfInUnsupportedRegion: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.unsupportedRegion,
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
                        hideTitle: context.args.hideTitle,
                        onFundsRequest: () => undefined,
                    });
                    const { state } = await capitalOffer.getState();

                    if (state !== 'isInUnsupportedRegion' || context.args.mountIfInUnsupportedRegion) {
                        capitalOffer.mount('#capital-overview');
                    }
                };
                void getAdyenPlatformExperienceComponent();
            }, [context.args.hideTitle, context.args.mountIfInUnsupportedRegion]);

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
                        hideTitle: context.args.hideTitle,
                        onFundsRequest: () => undefined,
                    });
                    const { state } = await capitalOffer.getState();

                    if (state !== 'isUnqualified' || context.args.mountIfIneligible) {
                        capitalOffer.mount('#capital-overview');
                    }
                };
                void getAdyenPlatformExperienceComponent();
            }, [context.args.hideTitle, context.args.mountIfIneligible]);

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

export const EligibleCA: ElementStory<typeof CapitalOffer> = {
    name: 'Eligible CA',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleCA,
        },
    },
};

export const EligibleUS: ElementStory<typeof CapitalOffer> = {
    name: 'Eligible US',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleUS,
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
