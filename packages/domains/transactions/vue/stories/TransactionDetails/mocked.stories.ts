import type { Meta } from '@storybook/vue3';
import type { ITransactionWithDetails } from '@integration-components/types';
import { TransactionDetailsMeta } from './meta';
import { CUSTOM_URL_EXAMPLE, ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { TransactionDetailsExternalProps } from '../../src';
import { TRANSACTION_DETAILS_HANDLERS } from '../../../mocks/mock-server/transactions';

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

export const DataCustomization: ElementStory<TransactionDetailsExternalProps> = {
    name: 'Data customization',
    args: {
        ...sharedArgs,
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                    _summary: 'Summary link',
                    _sendEmail: 'Email',
                    _country: 'Country',
                },
            },
        },
        dataCustomization: {
            details: {
                fields: [
                    { key: 'description', visibility: 'hidden' },
                    { key: 'id', visibility: 'hidden' },
                    { key: '_store' },
                    { key: '_product' },
                    { key: '_summary' },
                    { key: '_sendEmail' },
                    { key: '_country' },
                ],
                onDataRetrieve: (data: ITransactionWithDetails) => {
                    return new Promise(resolve => {
                        resolve({
                            ...data,
                            _store: 'Sydney',
                            _product: 'Coffee',
                            _summary: {
                                type: 'link',
                                value: 'See summary',
                                config: { href: CUSTOM_URL_EXAMPLE },
                            },
                            _sendEmail: {
                                type: 'button',
                                value: 'Send email',
                                config: { action: () => console.log('Action') },
                            },
                            _country: {
                                type: 'icon',
                                value: '',
                                config: { src: 'https://flagicons.lipis.dev/flags/4x3/es.svg' },
                            },
                        });
                    });
                },
            },
        },
    },
    parameters: {
        msw: { ...TRANSACTION_DETAILS_HANDLERS.default },
    },
};

export default meta;
