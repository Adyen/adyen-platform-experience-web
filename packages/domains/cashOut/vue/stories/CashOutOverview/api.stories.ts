import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CashOutOverviewElement } from '../../src/CashOutOverview';
import { cashOutOverviewMeta } from './meta';

const meta: Meta<ElementProps<typeof CashOutOverviewElement>> = { ...cashOutOverviewMeta, title: 'API-connected/CashOut/CashOut Overview' };

export const Default: ElementStory<typeof CashOutOverviewElement, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
