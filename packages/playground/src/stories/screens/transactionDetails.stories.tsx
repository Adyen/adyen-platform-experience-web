import { Meta } from '@storybook/preact';
import { getTransactionById } from '../../utils/services';
import { TransactionsDetailsComponent } from '@adyen/adyen-fp-web';
import { ElementProps, ElementStory } from '../utils/types';
import { Container } from '../utils/Container';
import { TRANSACTION_DETAILS_DEFAULT } from '../../../../../mocks';

const DEFAULT_TRANSACTION_ID = process.env.VITE_DEFAULT_TRANSACTION_ID;

const meta: Meta<ElementProps<typeof TransactionsDetailsComponent>> = {
    title: 'screens/TransactionDetails',
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { transaction: context.loaded.data });
        }
        return <Container type={'transactionDetails'} componentConfiguration={args} context={context} />;
    },
};
export default meta;

export const Basic: ElementStory<typeof TransactionsDetailsComponent> = {
    args: {
        transaction: TRANSACTION_DETAILS_DEFAULT,
    },
};

export const ApiIntegration: ElementStory<typeof TransactionsDetailsComponent> = {
    loaders: [
        async () => ({
            data: await getTransactionById(DEFAULT_TRANSACTION_ID),
        }),
    ],
};
