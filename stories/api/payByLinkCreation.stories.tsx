import { Meta } from '@storybook/preact';
import { PayByLinkCreation } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { PayByLinkCreationMeta } from '../components/payByLinkCreation';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof PayByLinkCreation>> = { ...PayByLinkCreationMeta, title: 'API-connected/Pay by Link Creation' };

export const Default: ElementStory<typeof PayByLinkCreation, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
