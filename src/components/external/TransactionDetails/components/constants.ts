import { TRANSACTION_FIELDS } from '../../TransactionsOverview/components/TransactionsTable/TransactionsTable';
import type { TransactionDetailData } from '../types';

export const TX_DATA_CLASS = 'adyen-pe-transaction-data';
export const TX_DATA_AMOUNT = `${TX_DATA_CLASS}__amount`;
export const TX_DATA_ACTION_BAR = `${TX_DATA_CLASS}__action-bar`;
export const TX_DATA_CONTAINER = `${TX_DATA_CLASS}__container`;
export const TX_DATA_HEAD_CONTAINER = `${TX_DATA_CLASS}__head-container`;
export const TX_DATA_INPUT = `${TX_DATA_CLASS}__input`;
export const TX_DATA_INPUT_CHARS = `${TX_DATA_INPUT}-chars-counter`;
export const TX_DATA_INPUT_CONTAINER = `${TX_DATA_INPUT}-container`;
export const TX_DATA_INPUT_CONTAINER_SHORT = `${TX_DATA_INPUT_CONTAINER}--short`;
export const TX_DATA_INPUT_CONTAINER_TEXT = `${TX_DATA_INPUT_CONTAINER}--text-input`;
export const TX_DATA_INPUT_CONTAINER_WITH_ERROR = `${TX_DATA_INPUT_CONTAINER}--with-error`;
export const TX_DATA_INPUT_HEAD = `${TX_DATA_INPUT}-head`;
export const TX_DATA_INPUT_TEXTAREA = `${TX_DATA_INPUT}--textarea`;
export const TX_DATA_LABEL = `${TX_DATA_CLASS}__label`;
export const TX_DATA_LIST = `${TX_DATA_CLASS}__list`;
export const TX_DATA_PAY_METHOD = `${TX_DATA_CLASS}__payment-method`;
export const TX_DATA_PAY_METHOD_DETAIL = `${TX_DATA_PAY_METHOD}-detail`;
export const TX_DATA_PAY_METHOD_LOGO = `${TX_DATA_PAY_METHOD}-logo`;
export const TX_DATA_PAY_METHOD_LOGO_CONTAINER = `${TX_DATA_PAY_METHOD_LOGO}-container`;
export const TX_DATA_TAGS = `${TX_DATA_CLASS}__tags`;
export const TX_STATUS_BOX = `${TX_DATA_CLASS}__status-box`;
export const TX_REFUND_RESPONSE = `${TX_DATA_CLASS}__refund-response`;
export const TX_REFUND_RESPONSE_ICON = `${TX_DATA_CLASS}__refund-response-icon`;
export const TX_REFUND_RESPONSE_SUCCESS_ICON = `${TX_REFUND_RESPONSE_ICON}--success`;
export const TX_REFUND_RESPONSE_ERROR_ICON = `${TX_REFUND_RESPONSE_ICON}--error`;
export const TX_REFUND_STATUSES_CONTAINER = `${TX_DATA_CLASS}__refund-statuses-container`;

export const TX_DETAILS_RESERVED_FIELDS_SET = new Set([
    ...(['status', 'category', 'paymentMethod', 'bankAccount', 'balanceAccount', 'id', 'balanceAccountId'] satisfies (keyof TransactionDetailData)[]),
    ...TRANSACTION_FIELDS,
    'deductedAmount',
    'lineItems',
    'originalAmount',
    'paymentPspReference',
    'refundDetails',
    'refundMetadata',
] as const);
