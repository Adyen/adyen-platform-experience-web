import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, getMySessionToken, SetupControls } from '@integration-components/testing/storybook-helpers';
import { capitalOfferWithSetupMeta } from './components/capitalOffer';
import { CapitalOffer, CapitalOverview } from '../src';
import { ILegalEntity } from '@integration-components/types';
import { CapitalOfferMockedResponses } from '../../mocks/mock-server/capital';
import { useEffect } from 'preact/compat';
import { AdyenPlatformExperience } from '../../../../../src';

const meta: Meta<ElementProps<typeof CapitalOffer> & SetupControls> = { ...capitalOfferWithSetupMeta, title: 'Mocked/Capital/Capital Offer' };

export const Default: ElementStory<typeof CapitalOffer> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.default,
        },
    },
};

export const WithAPRField: ElementStory<typeof CapitalOffer, { legalEntity: ILegalEntity }> = {
    name: 'With APR field',
    args: {
        mockedApi: true,
        legalEntity: {
            countryCode: 'CA',
            regions: [],
        },
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.aprField,
        },
    },
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

export const Unqualified: ElementStory<typeof CapitalOffer, { mountIfUnqualified: boolean }> = {
    name: 'Unqualified',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfUnqualified: true,
    },
    decorators: [
        (story, context) => {
            useEffect(() => {
                const getAdyenPlatformExperienceComponent = async () => {
                    const core = await AdyenPlatformExperience({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onSessionCreate: getMySessionToken as any,
                    });
                    const capitalOffer = new CapitalOffer({ core, onFundsRequest: () => undefined });
                    const { state } = await capitalOffer.getState();

                    if (state !== 'isUnqualified' || context.args.mountIfUnqualified) {
                        capitalOffer.mount('#capital-overview');
                    }
                };
                void getAdyenPlatformExperienceComponent();
            }, [context.args.mountIfUnqualified]);

            return <div className="component-wrapper" id="capital-overview"></div>;
        },
    ],
};

export const ErrorStateNoOfferCapability: ElementStory<typeof CapitalOffer> = {
    name: 'Error - State - No offer capability',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorStateNoOfferCapability,
        },
    },
};

export const ErrorStateInactiveAccountHolder: ElementStory<typeof CapitalOffer> = {
    name: 'Error - State - Inactive account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorStateInactiveAccountHolder,
        },
    },
};

export const ErrorDynamicOfferExceededRetries: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer - Exceeded retries',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorDynamicOfferExceededRetries,
        },
    },
};

export const ErrorDynamicOfferTemporary: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer - Temporary',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorDynamicOfferTemporary,
        },
    },
};

export const ErrorReviewOfferGeneric: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Review offer - Generic',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorReviewOfferGeneric,
        },
    },
};

export const ErrorRequestFundsGeneric: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Request funds - Generic',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorRequestFundsGeneric,
        },
    },
};

export const ErrorRequestFundsGenericWithCode: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Request funds - Generic with code',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorRequestFundsGenericWithCode,
        },
    },
};

export const ErrorRequestFundsNoPrimaryBalanceAccount: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Request funds - No primary balance account',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorRequestFundsNoPrimaryBalanceAccount,
        },
    },
};

export default meta;
