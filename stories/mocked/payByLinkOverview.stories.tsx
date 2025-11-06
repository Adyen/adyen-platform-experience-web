import { PayByLinkOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PayByLinkOverviewMeta } from '../components/payByLinkOverview';

const meta: Meta<ElementProps<typeof PayByLinkOverview>> = { ...PayByLinkOverviewMeta, title: 'Mocked/Pay By Link Overview' };
export const Default: ElementStory<typeof PayByLinkOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
