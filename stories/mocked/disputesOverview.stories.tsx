import { Meta } from '@storybook/preact';
import { CUSTOM_URL_EXAMPLE } from '../utils/constants';
import { ElementProps, ElementStory } from '../utils/types';
import { DisputesOverview } from '../../src';
import { DisputesOverviewMeta } from '../components/disputesOverview';
import { getCustomDisputesData } from './utils/customDataRequest';

const meta: Meta<ElementProps<typeof DisputesOverview>> = { ...DisputesOverviewMeta, title: 'Mocked/Disputes Overview' };

export const Default: ElementStory<typeof DisputesOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const DataCustomization: ElementStory<typeof DisputesOverview> = {
    name: 'Data customization',
    args: {
        coreOptions: {
            translations: {
                en_US: {
                    _summary: 'Summary',
                    _sendEmail: 'Action',
                },
            },
        },
        mockedApi: true,
        dataCustomization: {
            list: {
                fields: [{ key: 'createdAt' }, { key: '_summary' }, { key: '_sendEmail', align: 'right' }],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(getCustomDisputesData(data));
                        }, 200);
                    });
                },
            },
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
