import type { Meta } from '@storybook/vue3';
import { TransactionDetailsMeta } from './meta';
import type { TransactionDetailsExternalProps } from '../../src';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<TransactionDetailsExternalProps>> = {
    ...TransactionDetailsMeta,
    title: 'API-connected/Transactions/Transaction Details',
};

export const Default: ElementStory<TransactionDetailsExternalProps, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        id: 'EVJN42CKX223223N5LV3B7V5VK2LT8EUR',
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
