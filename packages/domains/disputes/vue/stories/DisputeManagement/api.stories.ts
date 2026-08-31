import type { Meta } from '@storybook/vue3';
import { DisputeManagementMeta } from './meta';
import type { DisputeManagementDomainProps as DisputeManagementExternalProps } from '../../src/definitions';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<DisputeManagementExternalProps>> = { ...DisputeManagementMeta, title: 'API-connected/Disputes/Dispute Management' };

export const Default: ElementStory<DisputeManagementExternalProps, SessionControls> = {
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
