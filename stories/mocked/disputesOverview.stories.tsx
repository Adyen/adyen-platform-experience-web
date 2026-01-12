import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { DisputesOverview, DisputeManagement } from '../../src';
import { DisputesOverviewMeta } from '../components/disputesOverview';
import { DISPUTES_LIST_HANDLERS } from '../../mocks/mock-server/disputes';
import { CUSTOM_URL_EXAMPLE } from '../utils/constants';

const meta: Meta<ElementProps<typeof DisputesOverview>> = { ...DisputesOverviewMeta, title: 'Mocked/Disputes/Disputes Overview' };

export const Default: ElementStory<typeof DisputesOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const EmptyList: ElementStory<typeof DisputesOverview> = {
    name: 'Empty list',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_LIST_HANDLERS.emptyList,
        },
    },
};

export const InternalServerError: ElementStory<typeof DisputesOverview> = {
    name: 'Error - Internal server error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_LIST_HANDLERS.internalServerError,
        },
    },
};

export const NetworkError: ElementStory<typeof DisputesOverview> = {
    name: 'Error - Network error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_LIST_HANDLERS.networkError,
        },
    },
};

export const DataCustomization: ElementStory<typeof DisputeManagement> = {
    name: 'Data Customization',
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
