import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { Cashout } from '../../src';
import { CashoutMeta } from '../components/cashout';

const meta: Meta<ElementProps<typeof Cashout>> = { ...CashoutMeta, title: 'Mocked/Cashout/Cashout' };

export const Default: ElementStory<typeof Cashout> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
