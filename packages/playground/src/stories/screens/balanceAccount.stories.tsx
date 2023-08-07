import { Meta } from '@storybook/preact';
import { getBalanceAccountById } from '../../utils/services';
import { Container } from '../utils/Container';
import { BalanceAccountComponent } from '@adyen/adyen-fp-web';
import { ElementProps, ElementStory } from '../utils/types';

const DEFAULT_BALANCE_ACCOUNT = process.env.VITE_DEFAULT_BALANCE_ACCOUNT_ID;

export default {
    title: 'screens/BalanceAccount',
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { balanceAccount: context.loaded.data });
        }
        return <Container type={'balanceAccount'} componentConfiguration={args} context={context} />;
    },
} satisfies Meta<ElementProps<typeof BalanceAccountComponent>>;

export const BasicBalanceAccount: ElementStory<typeof BalanceAccountComponent> = {
    loaders: [
        async () => ({
            data: await getBalanceAccountById(DEFAULT_BALANCE_ACCOUNT),
        }),
    ],
};
