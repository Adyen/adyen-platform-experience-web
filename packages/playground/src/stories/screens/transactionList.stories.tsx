import { Meta } from '@storybook/preact';
import { getMyTransactions } from '../../utils/services';
import { disableControls, enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionsComponent } from '@adyen/adyen-fp-web';
import { ElementProps, ElementStory } from '../utils/types';
import { Container } from '../utils/Container';

export default {
    title: 'screens/Transactions',
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { transactions: context.loaded.data });
        }
        return <Container type={'transactionList'} componentConfiguration={args} context={context} />;
    },
} satisfies Meta<ElementProps<typeof TransactionsComponent>>;

export const BasicTransactionList: ElementStory<typeof TransactionsComponent> = {
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
};
