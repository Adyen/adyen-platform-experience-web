import { Meta } from '@storybook/preact';
import DisputeManagementElement from '../../src/components/external/DisputeManagement/DisputeManagementElement';
import { DisputeManagementMeta } from '../components/disputeManagement';
import { CUSTOM_URL_EXAMPLE } from '../utils/constants';
import { ElementProps, ElementStory } from '../utils/types';
import { DISPUTES_HANDLERS } from '../../mocks/mock-server/disputes';

const meta: Meta<ElementProps<typeof DisputeManagementElement>> = { ...DisputeManagementMeta, title: 'API-connected/Dispute Management' };

export const Default: ElementStory<typeof DisputeManagementElement> = {
    name: 'Default',
};

export default meta;
