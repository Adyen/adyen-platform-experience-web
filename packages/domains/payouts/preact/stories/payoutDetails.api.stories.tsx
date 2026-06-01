import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import { PayoutDetails } from '@integration-components/payouts/publish';
import { PayoutDetailsMeta } from './payoutDetails.meta';

const meta: Meta<ElementProps<typeof PayoutDetails>> = { ...PayoutDetailsMeta, title: 'API-connected/Payouts/Payout Details' };

export const Default: ElementStory<typeof PayoutDetails, SessionControls> = {
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
