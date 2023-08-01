import { Meta } from '@storybook/preact';
import { Story } from '../utils/story';
import { getTransactionById } from '../../utils/services';
import TransactionsDetails from '@adyen/adyen-fp-web/components/TransactionDetails/components/TransactionDetails';

const DEFAULT_TRANSACTION_ID = '1VVF0D5V3709DX6D';

export default {
    component: TransactionsDetails,
} satisfies Meta<typeof TransactionsDetails>;

export const BasicTransactionDetails: Story<typeof TransactionsDetails> = {
    loaders: [
        async () => ({
            data: await getTransactionById(DEFAULT_TRANSACTION_ID),
        }),
    ],
    render: (args, { loaded: { data } }) => <TransactionsDetails {...args} transaction={data} />,
};
