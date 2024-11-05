import { memo } from 'preact/compat';
import { createContext } from 'preact';
import { useCallback, useContext, useEffect, useMemo } from 'preact/hooks';
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from '../../../../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useTransactionNavigatorContext } from '../navigator';
import type { ITransactionDetailsContext, TransactionDetailsProviderProps } from './types';
import type { TranslationKey } from '../../../../../translations';
import { ButtonVariant } from '../../../../internal/Button/types';
import { ActiveView } from '../types';

const TransactionDetailsContext = createContext<ITransactionDetailsContext>({
    availableItems: EMPTY_ARRAY,
    primaryAction: noop,
    secondaryAction: noop,
    transaction: EMPTY_OBJECT as ITransactionDetailsContext['transaction'],
});

const enum TransactionNavigationAction {
    FORWARD = 1,
    BACKWARD,
}

export const TransactionDetailsProvider = memo(
    ({
        children,
        lineItems,
        refundAvailable: primaryActionAvailable,
        refundDisabled,
        setActiveView,
        setPrimaryAction,
        setSecondaryAction,
        transaction,
    }: TransactionDetailsProviderProps) => {
        const { i18n } = useCoreContext();
        const { currentTransaction, canNavigateBackward, canNavigateForward, backward, forward, reset } = useTransactionNavigatorContext();

        const primaryActionLabel = useMemo(() => i18n.get('refundAction'), [i18n]);
        const primaryActionDisabled = useMemo(() => !primaryActionAvailable || refundDisabled, [primaryActionAvailable, refundDisabled]);
        const primaryAction = useCallback(
            () => void (!primaryActionDisabled && setActiveView(ActiveView.REFUND)),
            [primaryActionDisabled, setActiveView]
        );

        const _secondaryAction = useMemo<TransactionNavigationAction | undefined>(() => {
            if (currentTransaction !== transaction.id) return;
            if (canNavigateBackward) return TransactionNavigationAction.BACKWARD;
            if (canNavigateForward) return TransactionNavigationAction.FORWARD;
        }, [canNavigateBackward, canNavigateForward, currentTransaction, transaction]);

        const secondaryAction = useCallback(() => {
            switch (_secondaryAction) {
                case TransactionNavigationAction.BACKWARD:
                    return void backward();
                case TransactionNavigationAction.FORWARD:
                    return void forward();
            }
        }, [_secondaryAction, backward, forward]);

        const secondaryActionLabel = useMemo(() => {
            switch (_secondaryAction) {
                case TransactionNavigationAction.BACKWARD:
                    return i18n.get('Go to refund' as TranslationKey);
                case TransactionNavigationAction.FORWARD:
                    return i18n.get('Go to payment' as TranslationKey);
            }
        }, [_secondaryAction, i18n]);

        useEffect(() => {
            if (transaction.category === 'Refund') {
                reset(transaction.id, transaction.refundMetadata?.originalPaymentId);
            }
        }, [reset, transaction]);

        useEffect(() => {
            setPrimaryAction(
                primaryActionAvailable
                    ? Object.freeze({
                          disabled: primaryActionDisabled,
                          event: primaryAction,
                          title: primaryActionLabel,
                          variant: ButtonVariant.PRIMARY,
                      })
                    : undefined
            );
        }, [primaryAction, primaryActionAvailable, primaryActionDisabled, primaryActionLabel, setPrimaryAction]);

        useEffect(() => {
            setSecondaryAction(
                _secondaryAction && secondaryActionLabel
                    ? Object.freeze({
                          disabled: false,
                          event: secondaryAction,
                          title: secondaryActionLabel,
                          variant: ButtonVariant.SECONDARY,
                      })
                    : undefined
            );
        }, [_secondaryAction, secondaryAction, secondaryActionLabel, setSecondaryAction]);

        return (
            <TransactionDetailsContext.Provider value={{ availableItems: lineItems, primaryAction, secondaryAction, transaction }}>
                {children}
            </TransactionDetailsContext.Provider>
        );
    }
);

export const useTransactionDetailsContext = () => useContext(TransactionDetailsContext);
export default useTransactionDetailsContext;
