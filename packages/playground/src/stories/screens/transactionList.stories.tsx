import { Meta } from '@storybook/preact';
import { disableControls, enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionsComponent } from '@adyen/adyen-fp-web';
import { ElementProps, ElementStory } from '../utils/types';
import { Container } from '../utils/Container';
import { BASIC_TRANSACTIONS_LIST } from '../../../../../mocks';

const meta: Meta<ElementProps<typeof TransactionsComponent>> = {
    title: 'screens/Transactions',
    argTypes: {
        onUpdateTransactions: disableControls,
        onFilterChange: enabledDisabledCallbackRadioControls('onFilterChange', ['Passed', 'Not Passed']),
        onTransactionSelected: enabledDisabledCallbackRadioControls('onTransactionSelected'),
        onBalanceAccountSelected: enabledDisabledCallbackRadioControls('onBalanceAccountSelected'),
        onAccountSelected: enabledDisabledCallbackRadioControls('onAccountSelected'),
    },
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { transactions: context.loaded.data });
        }

        return <Container type={'transactionList'} componentConfiguration={args} context={context} />;
    },
};
export const Basic: ElementStory<typeof TransactionsComponent> = {
    args: {
        transactions: { data: BASIC_TRANSACTIONS_LIST, _links: {} },
    },
};

export const BasicTransactionList: ElementStory<typeof TransactionsComponent> = {
    args: {
        balancePlatformId: process.env.VITE_BALANCE_PLATFORM,
    },
};

export default meta;
