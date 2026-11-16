import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CashOutRequestElement } from '../../src/CashOutRequest';
import { cashOutRequestMeta } from './meta';

const meta: Meta<ElementProps<typeof CashOutRequestElement>> = { ...cashOutRequestMeta, title: 'API-connected/CashOut/CashOut Request' };

export const Default: ElementStory<typeof CashOutRequestElement, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
