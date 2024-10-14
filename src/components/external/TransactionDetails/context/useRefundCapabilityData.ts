import { useMemo } from 'preact/hooks';
import { useAuthContext } from '../../../../core/Auth';
import { boolOrFalse, isFunction } from '../../../../utils';
import { getDecimalAmount } from '../../../../core/Localization/amount/amount-util';
import { FULLY_REFUNDABLE_ONLY, NON_REFUNDABLE } from './constants';
import type { TransactionDataProps } from './types';

export const useRefundCapabilityData = (transaction: TransactionDataProps['transaction']) => {
    const details = transaction?.refundDetails;
    const mode = details?.refundMode ?? FULLY_REFUNDABLE_ONLY;
    const locked = boolOrFalse(details?.refundMode);
    const nonRefundable = mode === NON_REFUNDABLE;

    const currency = details?.refundableAmount.currency ?? transaction?.amount.currency ?? '';

    const availableAmount = useMemo(
        () => (transaction ? Math.max(0, getDecimalAmount(details?.refundableAmount.value ?? 0, currency)) : 0),
        [currency, transaction]
    );

    const available = isFunction(useAuthContext().endpoints.refundTransaction);
    const disabled = nonRefundable || locked || availableAmount <= 0;

    return { available, availableAmount, currency, disabled, locked, mode } as const;
};

export default useRefundCapabilityData;
