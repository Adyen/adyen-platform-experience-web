import { Meta } from '@storybook/preact';
import { TransactionDetails } from '../../src';
import { TransactionDetailsMeta } from '../components/Transactions/transactionDetails';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

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
