import { Meta } from '@storybook/preact';
import { TransactionDetails } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { TRANSACTION_DETAILS_HANDLERS } from '../../../mocks/mock-server/transactions';
import { TransactionDetailsMeta } from './meta';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION } from '../../../fixtures/data/TransactionDetails';

const meta: Meta<ElementProps<typeof TransactionDetails>> = { ...TransactionDetailsMeta, title: 'Mocked/Transactions/Transaction Details' };
const sharedArgs = { id: '4B7N9Q2Y6R1W5M8T', mockedApi: true };

export const Default: ElementStory<typeof TransactionDetails> = {
    name: 'Default',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.default },
    },
};

export const TabbedDetails: ElementStory<typeof TransactionDetails> = {
    name: 'Tabbed details',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.completeDetails },
    },
};

export const FullRefund: ElementStory<typeof TransactionDetails> = {
    name: 'Full refund',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.fullRefund },
    },
};

export const PartialRefund: ElementStory<typeof TransactionDetails> = {
    name: 'Partial refund',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.partialRefund },
    },
};

export const UnlinkedRefund: ElementStory<typeof TransactionDetails> = {
    name: 'Unlinked refund',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.unlinkedRefund },
    },
};

export const RefundNotAvailable: ElementStory<typeof TransactionDetails> = {
    name: 'Refund - Not available',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundNotAvailable },
    },
};

export const RefundLocked: ElementStory<typeof TransactionDetails> = {
    name: 'Refund - Locked',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundLocked },
    },
};

export const RefundFails: ElementStory<typeof TransactionDetails> = {
    name: 'Refund - Fails',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundFails },
    },
};

export const RefundableFullAmount: ElementStory<typeof TransactionDetails> = {
    name: 'Refundable - Full amount',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundableFullAmount },
    },
};

export const RefundablePartialAmount: ElementStory<typeof TransactionDetails> = {
    name: 'Refundable - Partial amount',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundablePartialAmount },
    },
};

export const NotRefundable: ElementStory<typeof TransactionDetails> = {
    name: 'Not refundable',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.notRefundable },
    },
};

export const RefundedFully: ElementStory<typeof TransactionDetails> = {
    name: 'Refunded - Fully',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundedFully },
    },
};

export const RefundedPartially: ElementStory<typeof TransactionDetails> = {
    name: 'Refunded - Partially',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundedPartially },
    },
};

export const RefundedPartiallyWithStatuses: ElementStory<typeof TransactionDetails> = {
    name: 'Refunded - Partially (statuses)',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundedPartiallyWithStatuses },
    },
};

export const ErrorNotFound: ElementStory<typeof TransactionDetails> = {
    name: 'Error - Not found',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.errorNotFound },
    },
};

export const DataCustomization: ElementStory<typeof TransactionDetails> = {
    name: 'Data Customization',
    args: {
        ...sharedArgs,
        coreOptions: {
            translations: { en_US: CUSTOM_TRANSLATIONS },
        },
        dataCustomization: { details: DATA_CUSTOMIZATION },
    },
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.default },
    },
};

export default meta;
