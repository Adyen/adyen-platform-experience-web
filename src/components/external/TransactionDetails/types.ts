import type { StrictUnion } from '../../../utils/types';
import { IBalanceAccountBase, ILineItem, IRefundReason, ITransactionWithDetails } from '../../../types';
import { CustomDataRetrieved, DetailsDataCustomizationObject } from '../../types';

export interface DetailsWithoutIdProps {
    data: TransactionDetailData;
}

export interface DetailsWithIdProps {
    id: string;
}

export type TransactionDetailsCustomization = DetailsDataCustomizationObject<TransactionDetailsFields, TransactionDetailData, CustomDataRetrieved>;

export interface DetailsWithExtraData<T extends DetailsDataCustomizationObject<any, any, any>> {
    dataCustomization?: {
        details?: T;
    };
}

export type DetailsComponentProps = StrictUnion<DetailsWithoutIdProps | DetailsWithIdProps>;

export type TransactionDetailData = ITransactionWithDetails & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccount?: IBalanceAccountBase;
}

export interface TransactionDataProps {
    error?: boolean;
    isFetching?: boolean;
    transaction?: TransactionDetailData & { lineItems?: ILineItem[] };
    dataCustomization?: { details?: DetailsDataCustomizationObject<TransactionDetailsFields, TransactionDetailData, CustomDataRetrieved> };
    // TODO - Unify this parameter with dataCustomization
    extraFields: Record<string, any> | undefined;
}

export type TransactionDetailsFields =
    | 'amount'
    | 'amountBeforeDeductions'
    | 'balanceAccount'
    | 'balanceAccountId'
    | 'bankAccount'
    | 'category'
    | 'createdAt'
    | 'currency'
    | 'deductedAmount'
    | 'grossAmount'
    | 'id'
    | 'lineItems'
    | 'netAmount'
    | 'originalAmount'
    | 'paymentMethod'
    | 'paymentPspReference'
    | 'pspReference'
    | 'refundDetails'
    | 'refundMetadata'
    | 'status'
    | 'transactionType';

export type TransactionDetailsProps = DetailsComponentProps & DetailsWithExtraData<TransactionDetailsCustomization>;

export const enum ActiveView {
    DETAILS = 'details',
    REFUND = 'refund',
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
