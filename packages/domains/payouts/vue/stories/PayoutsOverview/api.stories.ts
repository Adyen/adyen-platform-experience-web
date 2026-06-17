import type { Meta } from '@storybook/vue3';
import { PayoutsOverviewMeta } from './meta';
import type { PayoutsOverviewExternalProps } from '../../src';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<PayoutsOverviewExternalProps>> = {
    ...PayoutsOverviewMeta,
    title: 'API-connected/Payouts/Payouts Overview',
};

export const Default: ElementStory<PayoutsOverviewExternalProps, SessionControls> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
