import { Meta } from '@storybook/preact';
import { Container } from '../utils/Container';
import { BalanceAccountComponent } from '@adyen/adyen-fp-web';
import { ElementProps, ElementStory } from '../utils/types';
import { BALANCE_ACCOUNT_DETAILS_1 } from '../../../../../mocks';

const DEFAULT_BALANCE_ACCOUNT = process.env.VITE_DEFAULT_BALANCE_ACCOUNT_ID;

const meta: Meta<ElementProps<typeof BalanceAccountComponent>> = {
    title: 'screens/BalanceAccount',
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { balanceAccount: context.loaded.data });
        }
        return <Container component={BalanceAccountComponent} componentConfiguration={args} context={context} />;
    },
};
export const Basic: ElementStory<typeof BalanceAccountComponent> = {
    args: {
        balanceAccount: BALANCE_ACCOUNT_DETAILS_1,
    },
};

export const ApiIntegration: ElementStory<typeof BalanceAccountComponent> = {
    args: {
        balanceAccountId: DEFAULT_BALANCE_ACCOUNT,
    },
};

export default meta;
