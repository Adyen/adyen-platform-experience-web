import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { DisputesOverview } from '../../src';
import { DisputesOverviewMeta } from './meta';
import { DISPUTES_LIST_HANDLERS } from '../../../mocks/mock-server/disputes';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION_DETAILS, DATA_CUSTOMIZATION_LIST } from '../../../fixtures/data/DisputesOverview';

const meta: Meta<ElementProps<typeof DisputesOverview>> = { ...DisputesOverviewMeta, title: 'Mocked/Disputes/Disputes Overview' };
const sharedArgs = { mockedApi: true };

export const Default: ElementStory<typeof DisputesOverview> = {
    name: 'Default',
    args: sharedArgs,
};

export const EmptyList: ElementStory<typeof DisputesOverview> = {
    name: 'Empty list',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.emptyList },
    },
};

export const InternalServerError: ElementStory<typeof DisputesOverview> = {
    name: 'Error - Internal server error',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.internalServerError },
    },
};

export const NetworkError: ElementStory<typeof DisputesOverview> = {
    name: 'Error - Network error',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.networkError },
    },
};

export const DataCustomization: ElementStory<typeof DisputesOverview> = {
    name: 'Data Customization',
    args: {
        ...sharedArgs,
        coreOptions: {
            translations: { en_US: CUSTOM_TRANSLATIONS },
        },
        dataCustomization: {
            details: DATA_CUSTOMIZATION_DETAILS,
            list: DATA_CUSTOMIZATION_LIST,
        },
    },
};

export default meta;
