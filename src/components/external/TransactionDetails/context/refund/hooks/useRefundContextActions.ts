import { useRefundAction } from './useRefundAction';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import type { ITransactionRefundContext, TransactionRefundProviderProps } from '../types';
import { ButtonVariant } from '../../../../../internal/Button/types';
import { ActiveView } from '../../types';

type _BaseUseRefundContextActionsProps = Parameters<typeof useRefundAction>[0] &
    Pick<TransactionRefundProviderProps, 'setActiveView' | 'setPrimaryAction' | 'setSecondaryAction'> &
    Pick<ITransactionRefundContext, 'interactionsDisabled'>;

export const useRefundContextActions = <T extends _BaseUseRefundContextActionsProps>({
    interactionsDisabled,
    refundAmount,
    setActiveView,
    setPrimaryAction,
    setSecondaryAction,
    ...refundActionProps
}: T) => {
    const { refundAction, refundActionLabel: primaryActionLabel } = useRefundAction({ ...refundActionProps, refundAmount, setActiveView });
    const { i18n } = useCoreContext();

    const primaryActionDisabled = useMemo(() => interactionsDisabled || refundAmount.value <= 0, [refundAmount, interactionsDisabled]);
    const primaryAction = useCallback(() => !primaryActionDisabled && refundAction(), [primaryActionDisabled, refundAction]);

    const secondaryActionDisabled = interactionsDisabled;
    const secondaryActionLabel = useMemo(() => i18n.get('transactions.details.refund.actions.back'), [i18n]);

    const secondaryAction = useCallback(
        () => void (!secondaryActionDisabled && setActiveView(ActiveView.DETAILS)),
        [secondaryActionDisabled, setActiveView]
    );

    useEffect(() => {
        setPrimaryAction(
            Object.freeze({
                disabled: primaryActionDisabled,
                event: primaryAction,
                variant: ButtonVariant.PRIMARY,
                ...primaryActionLabel,
            })
        );
    }, [primaryAction, primaryActionDisabled, primaryActionLabel, setPrimaryAction]);

    useEffect(() => {
        setSecondaryAction(
            Object.freeze({
                disabled: secondaryActionDisabled,
                event: secondaryAction,
                title: secondaryActionLabel,
                variant: ButtonVariant.SECONDARY,
            })
        );
    }, [secondaryAction, secondaryActionDisabled, secondaryActionLabel, setSecondaryAction]);

    return { primaryAction, secondaryAction } as const;
};
