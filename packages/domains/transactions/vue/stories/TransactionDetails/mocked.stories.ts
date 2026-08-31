import type { Meta } from '@storybook/vue3';
import { TransactionDetailsMeta } from './meta';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { TransactionDetailsExternalProps } from '../../src';
import { TRANSACTION_DETAILS_HANDLERS } from '../../../mocks/mock-server/transactions';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION } from '../../../fixtures/data/TransactionDetails';

const meta: Meta<ElementProps<TransactionDetailsExternalProps>> = {
    ...TransactionDetailsMeta,
    title: 'Mocked/Transactions/Transaction Details',
};

const sharedArgs = { id: '4B7N9Q2Y6R1W5M8T', mockedApi: true };

export const Default: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Default',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.default },
    },
};

export const TabbedDetails: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Tabbed details',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.completeDetails },
    },
};

export const FullRefund: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Full refund',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.fullRefund },
    },
};

export const PartialRefund: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Partial refund',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.partialRefund },
    },
};

export const UnlinkedRefund: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Unlinked refund',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.unlinkedRefund },
    },
};

export const RefundNotAvailable: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Refund - Not available',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundNotAvailable },
    },
};

export const RefundLocked: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Refund - Locked',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundLocked },
    },
};

export const RefundFails: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Refund - Fails',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundFails },
    },
};

export const RefundableFullAmount: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Refundable - Full amount',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundableFullAmount },
    },
};

export const RefundablePartialAmount: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Refundable - Partial amount',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundablePartialAmount },
    },
};

export const NotRefundable: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Not refundable',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.notRefundable },
    },
};

export const RefundedFully: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Refunded - Fully',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundedFully },
    },
};

export const RefundedPartially: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Refunded - Partially',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundedPartially },
    },
};

export const RefundedPartiallyWithStatuses: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Refunded - Partially (statuses)',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.refundedPartiallyWithStatuses },
    },
};

export const ErrorNotFound: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Error - Not found',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.errorNotFound },
    },
};

export const DetailsRoleNotAssigned: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Error - Role not assigned',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.permissionError },
    },
};

export const DataCustomization: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Data customization',
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
