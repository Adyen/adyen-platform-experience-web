import { REFUND_REASONS } from './constants';
import type { PropsWithChildren } from 'preact/compat';
import type { ButtonActionObject } from '../../../internal/Button/ButtonActions/types';
import type { ILineItem } from '../../../../types';

export const enum ActiveView {
    DETAILS,
    REFUND,
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

export const enum RefundStatus {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export const enum RefundType {
    PARTIAL = 'partial',
    FULL = 'full',
}

export type RefundReason = (typeof REFUND_REASONS)[number];

type _TransactionDataContextBase<T extends TransactionDataContextProviderProps> = Omit<T, _TransactionDataContextExcludedProps> & {
    primaryAction: () => void;
    secondaryAction: () => void;
};

export type _TransactionDataContextExcludedProps =
    | 'children'
    | 'lineItems'
    | 'refundAmount'
    | 'refundAvailable'
    | 'refundDisabled'
    | 'setActiveView'
    | 'setPrimaryAction'
    | 'setSecondaryAction';

export type TransactionDataContext<T extends TransactionDataContextProviderProps> = _TransactionDataContextBase<T>;

export interface TransactionDataContextProviderProps extends PropsWithChildren {
    lineItems: readonly ILineItem[];
    refundAvailable: boolean;
    refundDisabled: boolean;
    setActiveView: (activeView: ActiveView) => void;
    setPrimaryAction: (action: ButtonActionObject | undefined) => void;
    setSecondaryAction: (action: ButtonActionObject | undefined) => void;
}
