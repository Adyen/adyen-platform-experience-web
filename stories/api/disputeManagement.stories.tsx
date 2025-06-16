import { Meta } from '@storybook/preact';
import DisputeManagementElement from '../../src/components/external/DisputeManagement/DisputeManagementElement';
import { DisputeManagementMeta } from '../components/disputeManagement';
import { ElementProps, ElementStory } from '../utils/types';

const meta: Meta<ElementProps<typeof DisputeManagementElement>> = { ...DisputeManagementMeta, title: 'API-connected/Dispute Management' };

export const Default: ElementStory<typeof DisputeManagementElement> = {
    name: 'Default',
    args: {
        id: 'EVJN42CKX223223N5LV3B7V5VK2LT8EUR',
        mockedApi: false,
    },
};

export default meta;
