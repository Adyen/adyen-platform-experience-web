import { Meta } from '@storybook/preact';
import DisputeManagementElement from '../../src/components/external/DisputesManagement/DisputeManagementElement';
import { DisputesManagementMeta } from '../components/disputesManagement';
import { ElementProps, ElementStory } from '../utils/types';

const meta: Meta<ElementProps<typeof DisputeManagementElement>> = { ...DisputesManagementMeta, title: 'Mocked/Disputes Management' };

export const Default: ElementStory<typeof DisputeManagementElement> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
