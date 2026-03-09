import type { CoreInstance } from '../../core/types';

export interface TransactionAmount {
    value: number;
    currency: string;
}

export interface TransactionPaymentMethod {
    type?: string;
    description?: string;
    lastFourDigits?: string;
}

export interface TransactionBankAccount {
    iban?: string;
    ownerName?: string;
}

export interface TransactionBalanceAccount {
    id: string;
    description?: string;
    timeZone?: string;
}

export interface TransactionEvent {
    amount: TransactionAmount;
    createdAt: string;
    status: string;
    type: string;
}

export interface TransactionAmountAdjustment extends TransactionAmount {
    type: string;
}

export interface TransactionRefundStatus {
    amount: TransactionAmount;
    status: string;
}

export interface TransactionRefundMetadata {
    originalPaymentId?: string;
    refundPspReference?: string;
    refundReason?: string;
    refundType?: string;
}

export interface TransactionRefundDetails {
    refundableAmount?: TransactionAmount;
    refundLocked?: boolean;
    refundMode?: string;
    refundStatuses?: TransactionRefundStatus[];
}

export interface TransactionDetails {
    id: string;
    category?: string;
    status?: string;
    createdAt: string;
    netAmount: TransactionAmount;
    amountBeforeDeductions: TransactionAmount;
    originalAmount?: TransactionAmount;
    additions?: TransactionAmountAdjustment[];
    deductions?: TransactionAmountAdjustment[];
    paymentMethod?: TransactionPaymentMethod;
    bankAccount?: TransactionBankAccount;
    balanceAccountId?: string;
    balanceAccount?: TransactionBalanceAccount;
    merchantReference?: string;
    paymentPspReference?: string;
    description?: string;
    events?: TransactionEvent[];
    lineItems?: ILineItem[];
    refundDetails?: TransactionRefundDetails;
    refundMetadata?: TransactionRefundMetadata;
}

export interface ILineItem {
    id: string;
    description?: string;
    amountIncludingTax: TransactionAmount;
    availableQuantity: number;
}

export interface TransactionDetailsCustomization {
    fields?: Record<string, { visibility?: 'hidden' | 'visible'; label?: string }>;
    onDataRetrieve?: (data: TransactionDetails) => Promise<Record<string, any>> | Record<string, any>;
}

export interface TransactionDetailsProps {
    id: string;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    dataCustomization?: {
        details?: TransactionDetailsCustomization;
    };
}

export interface TransactionDetailsExternalProps {
    core: CoreInstance;
    id: string;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    dataCustomization?: {
        details?: TransactionDetailsCustomization;
    };
}

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
    INDETERMINATE = 0,
    PARTIAL = 1,
    FULL = 2,
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

export type RefundReason = string;
export type RefundResult = 'done' | 'error';

export type RefundLineItem = Readonly<{
    id: ILineItem['id'];
    amount: ILineItem['amountIncludingTax']['value'];
    quantity: ILineItem['availableQuantity'];
}>;
