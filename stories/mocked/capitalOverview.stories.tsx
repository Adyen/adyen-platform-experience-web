import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { AdyenPlatformExperience, CapitalOverview } from '../../src';
import { CapitalOverviewMeta } from '../components/capitalOverview';
import { CapitalMockedResponses } from '../../mocks/mock-server/capital';
import { useEffect } from 'preact/compat';
import getMySessionToken from '../../playground/utils/sessionRequest';
import { ExternalPlatformElement } from '../utils/ExternalPlatformElement';
import { useState } from 'preact/hooks';

const meta: Meta<ElementProps<typeof CapitalOverview>> = { ...CapitalOverviewMeta, title: 'Mocked/Capital Overview' };

export const Default: ElementStory<typeof CapitalOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.prequalified,
        },
    },
};

export const PreQualified: ElementStory<typeof CapitalOverview> = {
    name: 'Pre-qualified',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.prequalified,
        },
    },
};

export const WithActiveGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Active Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.activeGrant,
    },
};

export const WithActiveUnrepaidGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Active Unrepaid Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.activeUnrepaidGrant,
    },
};

export const WithFailedGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Failed Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.failedGrant,
    },
};

export const WithPendingGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Pending Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.pendingGrant,
    },
};

export const WithRepaidGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Repaid Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.repaidGrant,
    },
};

export const WithRevokedGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Revoked Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.revokedGrant,
    },
};

export const WithWrittenOffGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Written Off Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.writtenOffGrant,
    },
};

export const Unqualified: ElementStory<typeof CapitalOverview> = {
    name: 'Unqualified',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.unqualified,
        },
    },
};

export const NoRender: ElementStory<typeof CapitalOverview, { showUnqualified: boolean }> = {
    name: 'No render unqualified',
    args: {
        mockedApi: true,
        skipDecorator: true,
        showUnqualified: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.unqualified,
        },
    },
    decorators: [
        (story, context) => {
            const [st, setSt] = useState<string>();

            useEffect(() => {
                const getAdyenPlatformExperienceComponent = async () => {
                    const core = await AdyenPlatformExperience({
                        onSessionCreate: getMySessionToken,
                    });
                    const AdyenCapitalOffer = new CapitalOverview({ core });

                    const state = await AdyenCapitalOffer.getState();

                    state === 'OfferAvailable' || context.args.showUnqualified ? AdyenCapitalOffer.mount('#capital-component') : undefined;

                    setSt(state);
                };
                void getAdyenPlatformExperienceComponent();
            }, [context.args.showUnqualified]);

            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 40 }}>
                    <ExternalPlatformElement>{'Element A'}</ExternalPlatformElement>
                    <div style={{ display: 'flex', gap: 5 }}>
                        <div style={{ width: 600 }}>
                            {st === 'NotQualified' && !context.args.showUnqualified ? (
                                <ExternalPlatformElement style={{ background: '#51aeff' }}>{'Element D'}</ExternalPlatformElement>
                            ) : (
                                <div id="capital-component"></div>
                            )}
                        </div>
                        <ExternalPlatformElement>{'Element B'}</ExternalPlatformElement>
                    </div>
                    <ExternalPlatformElement>{'Element C'}</ExternalPlatformElement>
                </div>
            );
        },
    ],
};

export default meta;
