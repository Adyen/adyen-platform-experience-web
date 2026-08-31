import type { Meta } from '@storybook/vue3';
import { PayoutDetailsMeta } from './meta';
import type { PayoutDetailsDomainProps } from '../../src/definitions';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<PayoutDetailsDomainProps>> = {
    ...PayoutDetailsMeta,
    title: 'API-connected/Payouts/Payout Details',
};

export const Default: ElementStory<PayoutDetailsDomainProps, SessionControls> = {
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

export default meta;
