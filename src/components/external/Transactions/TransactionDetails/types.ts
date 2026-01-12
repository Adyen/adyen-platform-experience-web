import { IBalanceAccountBase, ILineItem, IRefundReason, ITransactionWithDetails } from '../../../../types';
import { CustomDataRetrieved, DetailsDataCustomizationObject, ExternalUIComponentProps } from '../../../types';

export type TransactionDetailsCustomization = DetailsDataCustomizationObject<TransactionDetailsFields, TransactionDetails, CustomDataRetrieved>;

export interface DetailsWithExtraData<T extends DetailsDataCustomizationObject<any, any, any>> {
    dataCustomization?: {
        details?: T;
    };
}

export type TransactionDetails = ITransactionWithDetails & {
    balanceAccount?: IBalanceAccountBase;
    lineItems?: ILineItem[];
};

export type TransactionDetailsProps = ExternalUIComponentProps<{
    dataCustomization?: { details?: TransactionDetailsCustomization };
    id: string;
}>;

export type TransactionDetailsFields =
    | 'account'
    | 'amount'
    | 'amountBeforeDeductions'
    | 'balanceAccount'
    | 'balanceAccountId'
    | 'bankAccount'
    | 'category'
    | 'createdAt'
    | 'currency'
    | 'deductedAmount'
    | 'description'
    | 'grossAmount'
    | 'id'
    | 'lineItems'
    | 'merchantReference'
    | 'netAmount'
    | 'originalAmount'
    | 'paymentMethod'
    | 'paymentPspReference'
    | 'pspReference'
    | 'refundDetails'
    | 'refundMetadata'
    | 'refundPspReference'
    | 'refundReason'
    | 'status'
    | 'transactionType';

export const enum ActiveView {
    DETAILS = 'details',
    REFUND = 'refund',
}

export const enum DetailsTab {
    DETAILS = 'details',
    SUMMARY = 'summary',
    TIMELINE = 'timeline',
}

export const enum RefundedState {
    INDETERMINATE,
    PARTIAL,
    FULL,
}

export const enum RefundMode {
    NON_REFUNDABLE = 'non_refundable',
    PARTIAL_AMOUNT = 'partially_refundable_any_amount',
    PARTIAL_LINE_ITEMS = 'partially_refundable_with_line_items_required',
    FULL_AMOUNT = 'fully_refundable_only',
}

export const enum RefundType {
    PARTIAL = 'partial',
    FULL = 'full',
}

export type RefundReason = IRefundReason;
export type RefundResult = 'done' | 'error';

export type RefundLineItem = Readonly<{
    id: ILineItem['id'];
    amount: ILineItem['amountIncludingTax']['value'];
    quantity: ILineItem['availableQuantity'];
}>;

export type RefundLineItemUpdates = Readonly<{
    id: ILineItem['id'];
    amount?: ILineItem['amountIncludingTax']['value'];
    quantity: ILineItem['availableQuantity'];
}>[];
