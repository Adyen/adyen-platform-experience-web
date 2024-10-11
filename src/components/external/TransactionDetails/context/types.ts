import { REFUND_MODES, REFUND_REASONS } from './constants';
import type { Dispatch, StateUpdater } from 'preact/hooks';
import type { TransactionDetailData } from '../types';
import type { ButtonActionsList } from '../../../internal/Button/ButtonActions/types';

export interface ITransactionDataContext {
    dataViewActive: boolean;
    isLoading: boolean;
    refundReason: RefundReason;
    refundReference?: string;
    refundValue: number;
    refundValueMax: number;
    transaction: TransactionDetailData;
    updateRefundReason: (reason: RefundReason) => void;
    updateRefundReference: (reference: string) => void;
    updateRefundValue: (value: number) => void;
    viewActions: ButtonActionsList;
}

export interface TransactionDataContextProviderProps {
    children?: any;
    error?: boolean;
    forceHideTitle?: Dispatch<StateUpdater<boolean>>;
    isFetching?: boolean;
    transaction?: TransactionDetailData;
}

export type TransactionLineItem = TransactionDetailData['lineItems'][number];
export type TransactionLineItemWithQuantity = TransactionLineItem & { quantity: number };

export const enum ActiveView {
    DETAILS,
    REFUND,
}

export type RefundMode = (typeof REFUND_MODES)[number];
export type RefundReason = (typeof REFUND_REASONS)[number];
