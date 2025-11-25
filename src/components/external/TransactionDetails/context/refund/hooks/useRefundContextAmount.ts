import { RefundMode } from '../../types';
import { clamp } from '../../../../../../utils';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import type { IAmount } from '../../../../../../types';
import type { ITransactionRefundContext } from '../types';

type _BaseUseRefundContextAmountProps = Pick<
    ITransactionRefundContext,
    'availableAmount' | 'currency' | 'interactionsDisabled' | 'items' | 'refundMode'
>;

export const useRefundContextAmount = <T extends _BaseUseRefundContextAmountProps>({
    availableAmount,
    currency,
    interactionsDisabled,
    items,
    refundMode,
}: T) => {
    const [refundAmount, setRefundAmount] = useState(0);

    const _amount = useMemo(() => {
        switch (refundMode) {
            case RefundMode.NON_REFUNDABLE:
                return 0;
            case RefundMode.PARTIAL_LINE_ITEMS:
            case RefundMode.PARTIAL_AMOUNT:
                return refundAmount;
            // case RefundMode.PARTIAL_LINE_ITEMS:
            //     return items.reduce((total, { amount, quantity }) => total + amount * quantity, 0);
            case RefundMode.FULL_AMOUNT:
            default:
                return availableAmount;
        }
    }, [availableAmount, items, refundMode, refundAmount]);

    const amount = useMemo<Readonly<IAmount>>(() => Object.freeze({ currency, value: _amount }), [_amount, currency]);
    const canSetRefundAmount = useMemo(() => !interactionsDisabled && refundMode === RefundMode.PARTIAL_AMOUNT, [interactionsDisabled, refundMode]);

    const setAmount = useCallback<ITransactionRefundContext['setAmount']>(
        amount => void (canSetRefundAmount && setRefundAmount(clamp(0, amount, availableAmount))),
        [availableAmount, canSetRefundAmount]
    );

    useEffect(() => {
        setRefundAmount(availableAmount);
    }, [availableAmount]);

    return [amount, setAmount] as const;
};
