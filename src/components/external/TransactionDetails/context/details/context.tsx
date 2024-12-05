import { memo } from 'preact/compat';
import { createContext } from 'preact';
import { useCallback, useContext, useEffect, useMemo } from 'preact/hooks';
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from '../../../../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Icon from '../../../../internal/Icon';
import type { ButtonActionObject } from '../../../../internal/Button/ButtonActions/types';
import type { ITransactionDetailsContext, TransactionDetailsProviderProps } from './types';
import type { TranslationKey } from '../../../../../translations';
import { ButtonVariant } from '../../../../internal/Button/types';
import { ActiveView } from '../types';

const TransactionDetailsContext = createContext<ITransactionDetailsContext>({
    availableItems: EMPTY_ARRAY,
    primaryAction: noop,
    secondaryAction: noop,
    transaction: EMPTY_OBJECT as ITransactionDetailsContext['transaction'],
    extraFields: EMPTY_OBJECT,
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
        transactionNavigator,
        extraFields,
    }: TransactionDetailsProviderProps) => {
        const { i18n } = useCoreContext();
        const { currentTransaction, canNavigateBackward, canNavigateForward, backward, forward } = transactionNavigator;

        const primaryActionLabel = useMemo(() => ({ title: i18n.get('refundAction') }), [i18n]);
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
                    return {
                        title: i18n.get('refund.backToRefund' as TranslationKey),
                        renderTitle: (title: string) => (
                            <>
                                <Icon style={{ transform: 'scaleX(-1)' }} name="angle-right" />
                                <span>{title}</span>
                            </>
                        ),
                    };
                case TransactionNavigationAction.FORWARD:
                    return {
                        title: i18n.get('refund.goToPayment' as TranslationKey),
                        renderTitle: (title: string) => (
                            <>
                                <Icon name="angle-right" />
                                <span>{title}</span>
                            </>
                        ),
                    };
            }
        }, [_secondaryAction, i18n]);

        useEffect(() => {
            setPrimaryAction(
                primaryActionAvailable
                    ? Object.freeze({
                          disabled: primaryActionDisabled,
                          event: primaryAction,
                          variant: ButtonVariant.PRIMARY,
                          ...primaryActionLabel,
                      } as ButtonActionObject)
                    : undefined
            );
        }, [primaryAction, primaryActionAvailable, primaryActionDisabled, primaryActionLabel, setPrimaryAction]);

        useEffect(() => {
            setSecondaryAction(
                _secondaryAction && secondaryActionLabel
                    ? Object.freeze({
                          disabled: false,
                          event: secondaryAction,
                          variant: ButtonVariant.SECONDARY,
                          ...secondaryActionLabel,
                      } as ButtonActionObject)
                    : undefined
            );
        }, [_secondaryAction, secondaryAction, secondaryActionLabel, setSecondaryAction]);

        return (
            <TransactionDetailsContext.Provider value={{ availableItems: lineItems, primaryAction, secondaryAction, transaction, extraFields }}>
                {children}
            </TransactionDetailsContext.Provider>
        );
    }
);

export const useTransactionDetailsContext = () => useContext(TransactionDetailsContext);
export default useTransactionDetailsContext;
