import type { Meta } from '@storybook/vue3';
import { TransactionDetailsMeta } from '../components/transactionDetails';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import TransactionDetails from '../../src/TransactionDetails/TransactionDetailsWrapper.vue';

const meta: Meta<ElementProps<typeof TransactionDetails>> = {
    ...TransactionDetailsMeta,
    title: 'API-connected/Transactions/Transaction Details',
};

export default meta;

export const Default: ElementStory<typeof TransactionDetails> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        id: 'EVJN42CKX223223N5LV3B7V5VK2LT8EUR',
        session: EMPTY_SESSION_OBJECT,
    },
};
