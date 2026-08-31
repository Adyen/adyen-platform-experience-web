import type { Meta } from '@storybook/vue3';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { DisputesOverviewDomainProps as DisputesOverviewExternalProps } from '../../src/definitions';
import { DisputesOverviewMeta } from './meta';
import { DISPUTES_LIST_HANDLERS } from '../../../mocks/mock-server/disputes';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION_DETAILS, DATA_CUSTOMIZATION_LIST } from '../../../fixtures/data/DisputesOverview';

const meta: Meta<ElementProps<DisputesOverviewExternalProps>> = {
    ...DisputesOverviewMeta,
    title: 'Mocked/Disputes/Disputes Overview',
};

const sharedArgs = { mockedApi: true };

export const Default: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Default',
    args: sharedArgs,
};

export const EmptyList: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Empty list',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.emptyList },
    },
};

export const InternalServerError: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Error - Internal server error',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.internalServerError },
    },
};

export const NetworkError: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Error - Network error',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.networkError },
    },
};

export const OverviewRoleNotAssigned: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Error - Role not assigned',
    args: sharedArgs,
    parameters: {
        msw: { ...DISPUTES_LIST_HANDLERS.permissionError },
    },
};

export const DataCustomization: ElementStory<DisputesOverviewExternalProps> = {
    name: 'Data customization',
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
