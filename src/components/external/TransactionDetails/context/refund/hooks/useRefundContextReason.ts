import { useCallback, useMemo, useState } from 'preact/hooks';
import type { ITransactionRefundContext } from '../types';
import { RefundMode, type RefundReason } from '../../types';
import { REFUND_REASONS } from '../../constants';

type _BaseUseRefundContextReasonProps = Pick<ITransactionRefundContext, 'interactionsDisabled' | 'refundMode'>;

export const useRefundContextReason = <T extends _BaseUseRefundContextReasonProps>({ interactionsDisabled, refundMode }: T) => {
    const [refundReason, setReason] = useState<RefundReason>(REFUND_REASONS[0]);

    const canSetRefundReason = useMemo(
        // [TODO]: Remove refund mode check here and use the `refundable` field from `useTransactionRefundMetadata`
        () => !interactionsDisabled && refundMode !== RefundMode.NON_REFUNDABLE,
        [interactionsDisabled, refundMode]
    );

    const setRefundReason = useCallback<ITransactionRefundContext['setRefundReason']>(
        reason => void (canSetRefundReason && setReason(reason)),
        [canSetRefundReason]
    );

    return [refundReason, setRefundReason] as const;
};
