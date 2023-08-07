import { Meta } from '@storybook/preact';
import { getTransactionById } from '../../utils/services';
import { TransactionsDetailsComponent } from '@adyen/adyen-fp-web';
import { ElementProps, ElementStory } from '../utils/types';
import { Container } from '../utils/Container';

const DEFAULT_TRANSACTION_ID = process.env.VITE_DEFAULT_TRANSACTION_ID;

export default {
    title: 'screens/TransactionDetails',
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { transaction: context.loaded.data });
        }
        return <Container type={'transactionDetails'} componentConfiguration={args} context={context} />;
    },
} satisfies Meta<ElementProps<typeof TransactionsDetailsComponent>>;

export const BasicTransactionDetails: ElementStory<typeof TransactionsDetailsComponent> = {
    loaders: [
        async () => ({
            data: await getTransactionById(DEFAULT_TRANSACTION_ID),
        }),
    ],
};
