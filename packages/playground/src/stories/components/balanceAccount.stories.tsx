import { Meta } from '@storybook/preact';
import { Story } from '../utils/story';
import { getBalanceAccountById } from '../../utils/services';
import BalanceAccountDetails from '@adyen/adyen-fp-web/components/BalanceAccount/components/BalanceAccountDetails';

const DEFAULT_BALANCE_ACCOUNT = 'BA3227C223222B5CWF3T45SWD';

export default {
    component: BalanceAccountDetails,
} satisfies Meta<typeof BalanceAccountDetails>;

export const BasicBalanceAccount: Story<typeof BalanceAccountDetails> = {
    loaders: [
        async () => ({
            data: await getBalanceAccountById(DEFAULT_BALANCE_ACCOUNT),
        }),
    ],
    render: (args, { loaded: { data } }) => <BalanceAccountDetails {...args} balanceAccount={data} />,
};
