import { Meta } from '@storybook/preact';
import { Story } from '../utils/story';
import { getMyTransactions } from '../../utils/services';
import Transactions from '@adyen/adyen-fp-web/components/Transactions/components/Transactions';
import { disableControls, enabledDisabledCallbackRadioControls } from '../utils/controls';

export default {
    component: Transactions,
} satisfies Meta<typeof Transactions>;

export const BasicTransactionList: Story<typeof Transactions> = {
    argTypes: {
        onUpdateTransactions: disableControls,
        onFilterChange: enabledDisabledCallbackRadioControls('onFilterChange', ['Passed', 'Not Passed']),
        onTransactionSelected: enabledDisabledCallbackRadioControls('onTransactionSelected'),
        onBalanceAccountSelected: enabledDisabledCallbackRadioControls('onBalanceAccountSelected'),
        onAccountSelected: enabledDisabledCallbackRadioControls('onAccountSelected'),
    },
    args: {
        onUpdateTransactions: async (params, component) => {
            const transactions = await getMyTransactions(params);
            component?.update({ transactions });
        },
    },
    loaders: [
        async () => ({
            data: await getMyTransactions(),
        }),
    ],

    render: (args, { loaded: { data } }) => <Transactions {...args} transactions={data} />,
};
