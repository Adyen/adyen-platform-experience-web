import type { Meta } from '@storybook/vue3';
import { PayoutDetailsMeta } from '../components/payoutDetails';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import PayoutDetails from '../../src/PayoutDetails/PayoutDetailsWrapper.vue';

const meta: Meta<ElementProps<typeof PayoutDetails>> = {
    ...PayoutDetailsMeta,
    title: 'API-connected/Payouts/Payout Details',
};

export default meta;

export const Default: ElementStory<typeof PayoutDetails> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        date: '2025-06-13T00:00:00.000+00:00',
        id: 'BA32CKZ223227T5L6834T3LBX',
        session: EMPTY_SESSION_OBJECT,
    },
};
