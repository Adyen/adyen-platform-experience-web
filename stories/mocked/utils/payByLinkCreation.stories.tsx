import { Meta } from '@storybook/preact';
import { PayByLinkCreation } from '../../../src';
import { ElementProps, ElementStory } from '../../utils/types';
import { PayByLinkCreationMeta } from '../../components/payByLinkCreation';

const meta: Meta<ElementProps<typeof PayByLinkCreation>> = { ...PayByLinkCreationMeta, title: 'Mocked/Pay by link Creation' };

export const Default: ElementStory<typeof PayByLinkCreation> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
