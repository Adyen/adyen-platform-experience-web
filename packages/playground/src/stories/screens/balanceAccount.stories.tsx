import { Meta } from '@storybook/preact';
import { getBalanceAccountById } from '../../utils/services';
import { Container } from '../utils/Container';
import { BalanceAccountComponent } from '@adyen/adyen-fp-web';
import { ElementProps, ElementStory } from '../utils/types';
import { BALANCE_ACCOUNT_DETAILS_1 } from '../../../../../mocks';

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

export const Basic: ElementStory<typeof BalanceAccountComponent> = {
    args: {
        balanceAccount: BALANCE_ACCOUNT_DETAILS_1,
    },
};

export const ApiIntegration: ElementStory<typeof BalanceAccountComponent> = {
    loaders: [
        async () => ({
            data: await getBalanceAccountById(DEFAULT_BALANCE_ACCOUNT),
        }),
    ],
};
