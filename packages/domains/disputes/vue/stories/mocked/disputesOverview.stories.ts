import type { Meta } from '@storybook/vue3';
import { CUSTOM_URL_EXAMPLE, ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { IDisputeListItem } from '@integration-components/types/api/models/disputes';
import type { DisputesOverviewExternalProps } from '../../src';
import { DisputesOverviewMeta } from '../components/disputesOverview';
import { DISPUTES_LIST_HANDLERS } from '../../../mocks/mock-server/disputes';

const meta: Meta<ElementProps<DisputesOverviewExternalProps>> = {
    ...DisputesOverviewMeta,
    title: 'Mocked/Disputes/Disputes Overview',
};

const getCustomDisputesData = async (data: IDisputeListItem[]) =>
    data.map(dispute => ({
        ...dispute,
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
                src: 'https://flagicons.lipis.dev/flags/4x3/es.svg',
                alt: '',
            },
        },
    }));

export const Default: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const EmptyList: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Empty list',
    args: { mockedApi: true },
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Error - List',
    args: { mockedApi: true },
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.internalServerError },
    },
};

export const NetworkError: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Error - Network error',
    args: { mockedApi: true },
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.networkError },
    },
};

export const DataCustomization: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Data customization',
    args: {
        coreOptions: {
            translations: {
                en_US: {
                    _summary: 'Summary',
                    _sendEmail: 'Action',
                    _country: 'Country',
                },
            },
        },
        mockedApi: true,
        dataCustomization: {
            list: {
                fields: [
                    { key: 'disputeReason', visibility: 'hidden' },
                    { key: '_summary' },
                    { key: '_country', flex: 0.5 },
                    { key: '_sendEmail', align: 'right' },
                ],
                onDataRetrieve: data =>
                    new Promise(resolve => {
                        setTimeout(() => {
                            resolve(getCustomDisputesData(data));
                        }, 200);
                    }),
            },
        },
    },
};

export default meta;
