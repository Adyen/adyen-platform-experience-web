import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from '../../../utils';
import type { TranslationKey } from '../../../core/Localization/types';
import type { ButtonActionsList } from '../../internal/Button/ButtonActions/types';
import type { TransactionDetailData } from './types';

export const REFUND_REASONS = Object.freeze([
    'refundReason.requested',
    'refundReason.issue',
    'refundReason.fraud',
    'refundReason.duplicate',
    'refundReason.other',
] as const) satisfies readonly TranslationKey[];

export type RefundReason = (typeof REFUND_REASONS)[number];

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

export const TransactionDataContext = createContext<ITransactionDataContext>({
    dataViewActive: true,
    isLoading: true,
    refundReason: REFUND_REASONS[0],
    refundValue: 0,
    refundValueMax: 0,
    transaction: EMPTY_OBJECT,
    updateRefundReason: noop,
    updateRefundReference: noop,
    updateRefundValue: noop,
    viewActions: EMPTY_ARRAY,
});

export const useTransactionDataContext = () => useContext(TransactionDataContext);

export default useTransactionDataContext;
