import { Meta, StoryObj } from '@storybook/preact';
import { Container } from '../utils/Container';
import { AccountHolder, AccountHolderComponent } from '@adyen/adyen-fp-web';
import { ElementProps } from '../utils/types';
import { ACCOUNT_HOLDER_2 } from '../../../../../mocks';

const DEFAULT_ACCOUNT_HOLDER = process.env.VITE_DEFAULT_ACCOUNT_HOLDER_ID;

interface IAccountHolderScreen {
    customId?: string;
    accountHolderProps: ElementProps<typeof AccountHolderComponent>;
    accountHolder: AccountHolder;
}

const meta: Meta<IAccountHolderScreen> = {
    title: 'screens/AccountHolder',
    render: (args, context) => (
        <Container
            component={AccountHolderComponent}
            componentConfiguration={{
                ...args.accountHolderProps,
                accountHolder: args.accountHolder,
                accountHolderId: context.args.customId || args.accountHolderProps?.accountHolderId,
            }}
            context={context}
        />
    ),
};
export const Basic: StoryObj<IAccountHolderScreen> = {
    args: {
        accountHolder: ACCOUNT_HOLDER_2,
    },
};

export const ApiIntegration: StoryObj<IAccountHolderScreen> = {
    argTypes: {
        customId: {
            control: 'text',
        },
    },
    args: {
        accountHolderProps: {
            accountHolderId: DEFAULT_ACCOUNT_HOLDER ?? '',
        },
    },
};

export default meta;
