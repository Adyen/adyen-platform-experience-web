import { ElementProps, ElementStory, SetupControls } from '../../utils/types';
import { Meta } from '@storybook/preact';
import { AdyenPlatformExperience, CapitalOverview, ILegalEntity } from '../../../src';
import { CapitalOverviewWithSetupMeta } from '../../components/capitalOverview';
import { CapitalOverviewMockedResponses } from '../../../mocks/mock-server/capital';
import { useEffect } from 'preact/compat';
import getMySessionToken from '../../../playground/utils/sessionRequest';

const meta: Meta<ElementProps<typeof CapitalOverview> & SetupControls> = {
    ...CapitalOverviewWithSetupMeta,
    title: 'Mocked/Capital Overview',
};

export const UnsupportedRegion: ElementStory<typeof CapitalOverview, { mountIfInUnsupportedRegion: boolean; legalEntity: ILegalEntity }> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfInUnsupportedRegion: true,
        legalEntity: {
            countryCode: 'TR',
            region: 'Middle East',
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

export default meta;
