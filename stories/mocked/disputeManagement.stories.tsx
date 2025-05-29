import { Meta } from '@storybook/preact';
import DisputeManagementElement from '../../src/components/external/DisputeManagement/DisputeManagementElement';
import { DisputeManagementMeta } from '../components/disputeManagement';
import { CUSTOM_URL_EXAMPLE } from '../utils/constants';
import { ElementProps, ElementStory } from '../utils/types';
import { DISPUTES_HANDLERS } from '../../mocks/mock-server/disputes';

const meta: Meta<ElementProps<typeof DisputeManagementElement>> = { ...DisputeManagementMeta, title: 'Mocked/Dispute Management' };

export const Default: ElementStory<typeof DisputeManagementElement> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const ChargebackDefendableExternally: ElementStory<typeof DisputeManagementElement> = {
    name: 'Chargeback - Defendable externally',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_HANDLERS.chargebackDefendableExternally,
        },
    },
};

export const ChargebackLostNotDefended: ElementStory<typeof DisputeManagementElement> = {
    name: 'Chargeback - Lost (Not defended)',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_HANDLERS.chargebackLostNotDefended,
        },
    },
};

export const ChargebackAutoDefended: ElementStory<typeof DisputeManagementElement> = {
    name: 'Chargeback - Auto defended',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_HANDLERS.chargebackAutoDefended,
        },
    },
};

export const ChargebackNotDefendable: ElementStory<typeof DisputeManagementElement> = {
    name: 'Chargeback - Not defendable',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_HANDLERS.chargebackNotDefendable,
        },
    },
};

export const RFIUnresponded: ElementStory<typeof DisputeManagementElement> = {
    name: 'RFI - Unresponded',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_HANDLERS.rfiUnresponded,
        },
    },
};

export const RFIExpired: ElementStory<typeof DisputeManagementElement> = {
    name: 'RFI - Expired',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_HANDLERS.rfiExpired,
        },
    },
};

export const NotificationOfFraud: ElementStory<typeof DisputeManagementElement> = {
    name: 'Notification of fraud',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_HANDLERS.notificationOfFraud,
        },
    },
};

export const CustomData: ElementStory<typeof DisputeManagementElement> = {
    name: 'Custom Data',
    args: {
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                    _summary: 'Summary',
                    _sendEmail: 'Email',
                    _country: 'Country',
                },
            },
        },
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
        mockedApi: true,
        dataCustomization: {
            details: {
                fields: [
                    { key: 'id', visibility: 'hidden' },
                    { key: '_store' },
                    { key: '_product' },
                    { key: '_summary' },
                    { key: '_sendEmail' },
                    { key: '_country' },
                ],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        return resolve({
                            ...data,
                            _store: 'Sydney',
                            _product: 'Coffee',
                            _summary: {
                                type: 'link',
                                value: 'Summary',
                                config: {
                                    href: CUSTOM_URL_EXAMPLE,
                                },
                            },
                            _sendEmail: {
                                type: 'button',
                                value: 'Send email',
                                config: {
                                    action: () => console.log('Action'),
                                },
                            },
                            _country: {
                                type: 'icon',
                                value: '',
                                config: {
                                    src: `https://flagicons.lipis.dev/flags/4x3/es.svg`,
                                },
                            },
                        });
                    });
                },
            },
        },
    },
};

export default meta;
