import { Meta } from '@storybook/preact';
import { PayByLinkSettings } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PayByLinkSettingsMeta } from '../components/payByLinkSettings';

const meta: Meta<ElementProps<typeof PayByLinkSettings>> = { ...PayByLinkSettingsMeta, title: 'API-Connected/Pay by link Settings' };

export const Default: ElementStory<typeof PayByLinkSettings> = {
    name: 'Default',
    args: {
        mockedApi: false,
    },
};

export default meta;
