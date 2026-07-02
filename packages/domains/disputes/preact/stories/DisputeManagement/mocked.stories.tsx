import { Meta } from '@storybook/preact';
import { DisputeManagement } from '../../src';
import { DisputeManagementMeta } from './meta';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { DISPUTE_DETAILS_HANDLERS } from '../../../mocks/mock-server/disputes';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION, INITIAL_DISPUTE_ID } from '../../../fixtures/data/DisputeManagement';

const meta: Meta<ElementProps<typeof DisputeManagement>> = { ...DisputeManagementMeta, title: 'Mocked/Disputes/Dispute Management' };
const sharedArgs = { mockedApi: true };

export const Default: ElementStory<typeof DisputeManagement> = {
    name: 'Default',
    args: sharedArgs,
};

export const ChargebackAcceptable: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Acceptable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackAcceptable },
    },
};

export const ChargebackDefendable: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Defendable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackDefendable },
    },
};

export const ChargebackDefendableExternally: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Defendable externally',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackDefendableExternally },
    },
};

export const ChargebackLost: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Lost',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackLost },
    },
};

export const ChargebackLostWithIssuerFeedback: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Lost (with issuer feedback)',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackLostWithFeedback },
    },
};

export const ChargebackLostNotDefended: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Lost (not defended)',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackLostNotDefended },
    },
};

export const ChargebackDefended: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Defended',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackDefended },
    },
};

export const ChargebackAutoDefended: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Auto defended',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackAutoDefended },
    },
};

export const ChargebackNotDefendable: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Not defendable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.chargebackNotDefendable },
    },
};

export const RFIUnresponded: ElementStory<typeof DisputeManagement> = {
    name: 'RFI - Unresponded',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiUnresponded },
    },
};

export const RFIExpired: ElementStory<typeof DisputeManagement> = {
    name: 'RFI - Expired',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiExpired },
    },
};

export const RFIAcceptable: ElementStory<typeof DisputeManagement> = {
    name: 'RFI - Acceptable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiAcceptable },
    },
};

export const RFIAccepted: ElementStory<typeof DisputeManagement> = {
    name: 'RFI - Accepted',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiAccepted },
    },
};

export const RFIDefendable: ElementStory<typeof DisputeManagement> = {
    name: 'RFI - Defendable',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.rfiDefendable },
    },
};

export const NotificationOfFraud: ElementStory<typeof DisputeManagement> = {
    name: 'Notification of fraud',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.notificationOfFraud },
    },
};

export const ServerError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Server error',
    args: {
        ...sharedArgs,
        onContactSupport: undefined,
    },
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.internalServerError },
    },
};

export const NetworkError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Network error',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.networkError },
    },
};

export const UnprocessableEntityError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Unprocessable entity',
    args: {
        ...sharedArgs,
        onContactSupport: undefined,
    },
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.unprocessableEntityError },
    },
};

export const DownloadEvidenceError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Download evidence',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.downloadServerError },
    },
};

export const DefenseServerError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Defense server error',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTE_DETAILS_HANDLERS.defendServerError },
    },
};

export const DataCustomization: ElementStory<typeof DisputeManagement> = {
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
