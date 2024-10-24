import { useMemo } from 'preact/hooks';
import { useAuthContext } from '../../../../core/Auth';
import { boolOrFalse, isFunction } from '../../../../utils';
import type { ITransactionRefundMode } from '../../../../types';
import type { TransactionDataProps } from '../types';
import { RefundMode } from '../context/types';

export const useTransactionRefundMetadata = (transaction: TransactionDataProps['transaction']) => {
    const canRefund = isFunction(useAuthContext().endpoints.refundTransaction);
    const details = transaction?.refundDetails;
    const mode: ITransactionRefundMode = details?.refundMode ?? RefundMode.FULL_AMOUNT;
    const locked = boolOrFalse(details?.refundLocked);
    const refundable = mode !== RefundMode.NONE;

    const availableAmount = useMemo(() => (transaction ? Math.max(0, details?.refundableAmount.value ?? 0) : 0), [transaction]);

    const available = canRefund && refundable && availableAmount > 0;
    const currency = details?.refundableAmount.currency ?? transaction?.amount.currency ?? '';
    const disabled = locked;
    const viewDisabled = !available || disabled;

    return { available, availableAmount, canRefund, currency, disabled, locked, mode, refundable, viewDisabled } as const;
};

export default useTransactionRefundMetadata;
