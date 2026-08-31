import type { Meta } from '@storybook/vue3';
import { PayoutsOverviewMeta } from './meta';
import type { PayoutsOverviewDomainProps } from '../../src/definitions';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<PayoutsOverviewDomainProps>> = {
    ...PayoutsOverviewMeta,
    title: 'API-connected/Payouts/Payouts Overview',
};

export const Default: ElementStory<PayoutsOverviewDomainProps, SessionControls> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
