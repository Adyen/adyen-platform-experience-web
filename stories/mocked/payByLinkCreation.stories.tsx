import { Meta } from '@storybook/preact';
import { PayByLinkCreation } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PayByLinkCreationMeta } from '../components/payByLinkCreation';
import { action } from '@storybook/addon-actions';

const meta: Meta<ElementProps<typeof PayByLinkCreation>> = { ...PayByLinkCreationMeta, title: 'Mocked/Pay by link Creation' };

export const Default: ElementStory<typeof PayByLinkCreation> = {
    name: 'Default',
    args: {
        mockedApi: true,
        storeIds: ['New York Store', 'London Store'],
        onPaymentLinkCreated: action('Payment link created'),
    },
};

export default meta;
