import { Meta } from '@storybook/preact';
import { TransactionDetails } from '@integration-components/transactions/publish';
import { TransactionDetailsMeta } from './transactionDetails.meta';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<typeof TransactionDetails>> = { ...TransactionDetailsMeta, title: 'API-connected/Transactions/Transaction Details' };

export const Default: ElementStory<typeof TransactionDetails, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
        id: 'EVJN42CKX223223N5LV3B7V5VK2LT8EUR',
    },
};

export default meta;
