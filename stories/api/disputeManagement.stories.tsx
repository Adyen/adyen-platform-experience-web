import { Meta } from '@storybook/preact';
import { DisputeManagement } from '../../src';
import { DisputeManagementMeta } from '../components/disputeManagement';
import { ElementProps, ElementStory, SessionControls } from '@integration-components/testing/storybook-helpers';
import { EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<typeof DisputeManagement>> = { ...DisputeManagementMeta, title: 'API-connected/Disputes/Dispute Management' };

export const Default: ElementStory<typeof DisputeManagement, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        id: 'VP2ZGVQSPD22KMV5',
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
