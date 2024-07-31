import { REFUND_REASONS } from './constants';
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
    isFetching?: boolean;
    transaction: TransactionDetailData;
}

export type RefundReason = (typeof REFUND_REASONS)[number];
