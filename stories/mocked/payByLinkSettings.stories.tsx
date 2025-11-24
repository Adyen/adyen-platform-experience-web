import { Meta } from '@storybook/preact';
import { PayByLinkSettings } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PayByLinkSettingsMeta } from '../components/payByLinkSettings';

const meta: Meta<ElementProps<typeof PayByLinkSettings>> = { ...PayByLinkSettingsMeta, title: 'Mocked/Pay by link Settings' };

export const Default: ElementStory<typeof PayByLinkSettings> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
