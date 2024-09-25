import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../src';
import { CapitalOverviewMeta } from '../components/capitalOverview';
import { CapitalMockedResponses } from '../../mocks/mock-server/capital';

const meta: Meta<ElementProps<typeof CapitalOverview>> = { ...CapitalOverviewMeta, title: 'Mocked/Capital Overview' };

export const PreQualified: ElementStory<typeof CapitalOverview> = {
    name: 'Pre-qualified',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.prequalified,
        },
    },
};

export default meta;
