import { useMemo } from 'preact/hooks';
import { useAuthContext } from '../../../../core/Auth';
import { boolOrFalse, isFunction } from '../../../../utils';
import { FULLY_REFUNDABLE_ONLY, NON_REFUNDABLE } from '../context/constants';
import type { TransactionDataProps } from '../types';

export const useRefundCapabilityData = (transaction: TransactionDataProps['transaction']) => {
    const details = transaction?.refundDetails;
    const mode = details?.refundMode ?? FULLY_REFUNDABLE_ONLY;
    const locked = boolOrFalse(details?.refundMode);
    const nonRefundable = mode === NON_REFUNDABLE;

    const currency = details?.refundableAmount.currency ?? transaction?.amount.currency ?? '';

    const availableAmount = useMemo(() => (transaction ? Math.max(0, details?.refundableAmount.value ?? 0) : 0), [transaction]);

    const available = isFunction(useAuthContext().endpoints.refundTransaction);
    const disabled = nonRefundable || locked || availableAmount <= 0;

    return { available, availableAmount, currency, disabled, locked, mode } as const;
};

export default useRefundCapabilityData;
