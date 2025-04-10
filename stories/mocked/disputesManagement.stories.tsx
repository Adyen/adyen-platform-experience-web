import { Meta } from '@storybook/preact';
import DisputeManagementElement from '../../src/components/external/DisputesManagement/DisputeManagementElement';
import { DisputeManagementMeta } from '../components/disputesManagement';
import { ElementProps, ElementStory } from '../utils/types';

const meta: Meta<ElementProps<typeof DisputeManagementElement>> = { ...DisputeManagementMeta, title: 'Mocked/Dispute Management' };

export const Default: ElementStory<typeof DisputeManagementElement> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
