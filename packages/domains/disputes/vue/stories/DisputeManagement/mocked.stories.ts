import type { Meta } from '@storybook/vue3';
import { DisputeManagementMeta } from './meta';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { DisputeManagementExternalProps } from '../../src';
import { DISPUTE_DETAILS_HANDLERS } from '../../../mocks/mock-server/disputes';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION, INITIAL_DISPUTE_ID } from '../../../fixtures/data/DisputeManagement';

const meta: Meta<ElementProps<DisputeManagementExternalProps>> = { ...DisputeManagementMeta, title: 'Mocked/Disputes/Dispute Management' };
const sharedArgs = { mockedApi: true };

export const Default: ElementStory<DisputeManagementExternalProps> = {
    name: 'Default',
    args: sharedArgs,
};

export const ChargebackAcceptable: ElementStory<DisputeManagementExternalProps> = {
    name: 'Chargeback - Acceptable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackAcceptable },
    },
};

export const ChargebackDefendable: ElementStory<DisputeManagementExternalProps> = {
    name: 'Chargeback - Defendable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackDefendable },
    },
};

export const ChargebackDefendableExternally: ElementStory<DisputeManagementExternalProps> = {
    name: 'Chargeback - Defendable externally',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackDefendableExternally },
    },
};

export const ChargebackLost: ElementStory<DisputeManagementExternalProps> = {
    name: 'Chargeback - Lost',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackLost },
    },
};

export const ChargebackLostWithIssuerFeedback: ElementStory<DisputeManagementExternalProps> = {
    name: 'Chargeback - Lost (with issuer feedback)',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackLostWithFeedback },
    },
};

export const ChargebackLostNotDefended: ElementStory<DisputeManagementExternalProps> = {
    name: 'Chargeback - Lost (not defended)',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackLostNotDefended },
    },
};

export const ChargebackDefended: ElementStory<DisputeManagementExternalProps> = {
    name: 'Chargeback - Defended',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackDefended },
    },
};

export const ChargebackAutoDefended: ElementStory<DisputeManagementExternalProps> = {
    name: 'Chargeback - Auto defended',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackAutoDefended },
    },
};

export const ChargebackNotDefendable: ElementStory<DisputeManagementExternalProps> = {
    name: 'Chargeback - Not defendable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackNotDefendable },
    },
};

export const RFIUnresponded: ElementStory<DisputeManagementExternalProps> = {
    name: 'RFI - Unresponded',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiUnresponded },
    },
};

export const RFIExpired: ElementStory<DisputeManagementExternalProps> = {
    name: 'RFI - Expired',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiExpired },
    },
};

export const RFIAcceptable: ElementStory<DisputeManagementExternalProps> = {
    name: 'RFI - Acceptable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiAcceptable },
    },
};

export const RFIAccepted: ElementStory<DisputeManagementExternalProps> = {
    name: 'RFI - Accepted',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiAccepted },
    },
};

export const RFIDefendable: ElementStory<DisputeManagementExternalProps> = {
    name: 'RFI - Defendable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiDefendable },
    },
};

export const NotificationOfFraud: ElementStory<DisputeManagementExternalProps> = {
    name: 'Notification of fraud',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.notificationOfFraud },
    },
};

export const ServerError: ElementStory<DisputeManagementExternalProps> = {
    name: 'Error - Server error',
    args: {
        ...sharedArgs,
        onContactSupport: undefined,
    },
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.internalServerError },
    },
};

export const NetworkError: ElementStory<DisputeManagementExternalProps> = {
    name: 'Error - Network error',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.networkError },
    },
};

export const UnprocessableEntityError: ElementStory<DisputeManagementExternalProps> = {
    name: 'Error - Unprocessable entity',
    args: {
        ...sharedArgs,
        onContactSupport: undefined,
    },
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.unprocessableEntityError },
    },
};

export const DownloadEvidenceError: ElementStory<DisputeManagementExternalProps> = {
    name: 'Error - Download evidence',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.downloadServerError },
    },
};

export const DefenseServerError: ElementStory<DisputeManagementExternalProps> = {
    name: 'Error - Defense server error',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.defendServerError },
    },
};

export const DataCustomization: ElementStory<DisputeManagementExternalProps> = {
    name: 'Data Customization',
    args: {
        ...sharedArgs,
        id: INITIAL_DISPUTE_ID,
        coreOptions: {
            translations: { en_US: CUSTOM_TRANSLATIONS },
        },
        dataCustomization: { details: DATA_CUSTOMIZATION },
    },
};

export default meta;
