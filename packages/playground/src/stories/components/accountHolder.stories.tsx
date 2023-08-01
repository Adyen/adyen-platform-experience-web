import { Meta } from '@storybook/preact';
import { Story } from '../utils/story';
import { getAccountHolderById } from '../../utils/services';
import AccountHolderDetails from '@adyen/adyen-fp-web/components/AccountHolder/components/AccountHolderDetails';

const DEFAULT_ACCOUNT_HOLDER = 'AH3227B2248HKJ5BHTQPKC5GX';

export default {
    component: AccountHolderDetails,
} satisfies Meta<typeof AccountHolderDetails>;

export const BasicAccountHolder: Story<typeof AccountHolderDetails> = {
    loaders: [
        async () => ({
            data: await getAccountHolderById(DEFAULT_ACCOUNT_HOLDER),
        }),
    ],
    render: (args, { loaded: { data } }) => <AccountHolderDetails {...args} accountHolder={data} />,
};
