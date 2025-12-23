import { Meta } from '@storybook/preact';
import { PayByLinkSettings } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { PayByLinkSettingsMeta } from '../components/payByLinkSettings';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof PayByLinkSettings>> = { ...PayByLinkSettingsMeta, title: 'API-Connected/Pay by link Settings' };

export const Default: ElementStory<typeof PayByLinkSettings, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
