import { Meta, StoryObj } from '@storybook/preact';
import { getAccountHolderById } from '../../utils/services';
import { Container } from '../utils/Container';
import { AccountHolderComponent } from '@adyen/adyen-fp-web';
import { ElementProps } from '../utils/types';
import { ACCOUNT_HOLDER_1 } from '../../../../../mocks';

const DEFAULT_ACCOUNT_HOLDER = process.env.VITE_DEFAULT_ACCOUNT_HOLDER_ID;

interface IAccountHolderScreen {
    customId?: string;
    accountHolderProps: ElementProps<typeof AccountHolderComponent>;
}

export default {
    title: 'screens/AccountHolder',
    render: (args, context) => {
        if (context.loaded.data) {
            args.accountHolderProps = { ...args.accountHolderProps, accountHolder: context.loaded.data };
        }
        return <Container type={'accountHolder'} componentConfiguration={args.accountHolderProps} context={context} />;
    },
} satisfies Meta<IAccountHolderScreen>;
export const Basic: StoryObj<IAccountHolderScreen> = {
    args: {
        accountHolderProps: {
            accountHolder: ACCOUNT_HOLDER_1,
        },
    },
};

export const ApiIntegration: StoryObj<IAccountHolderScreen> = {
    argTypes: {
        customId: {
            control: 'text',
        },
    },
    loaders: [
        async context => ({
            data: await getAccountHolderById(context.args.customId ? context.args.customId : DEFAULT_ACCOUNT_HOLDER),
        }),
    ],
};
