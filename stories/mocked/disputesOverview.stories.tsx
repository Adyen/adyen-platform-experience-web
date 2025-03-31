import { Meta } from '@storybook/preact';
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
        },
    },
};

export default meta;
