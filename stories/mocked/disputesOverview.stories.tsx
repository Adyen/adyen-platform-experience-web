import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { DisputesOverview } from '../../src';
import { DisputesOverviewMeta } from '../components/disputesOverview';
import { DISPUTES_LIST_HANDLERS } from '../../mocks/mock-server/disputes';

const meta: Meta<ElementProps<typeof DisputesOverview>> = { ...DisputesOverviewMeta, title: 'Mocked/Disputes Overview' };

export const Default: ElementStory<typeof DisputesOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const InternalServerError: ElementStory<typeof DisputesOverview> = {
    name: 'Error - Internal server error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTES_LIST_HANDLERS.internal_server_error,
        },
    },
};

export default meta;
