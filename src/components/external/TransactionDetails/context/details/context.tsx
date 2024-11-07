import { memo } from 'preact/compat';
import { createContext } from 'preact';
import { useCallback, useContext, useEffect } from 'preact/hooks';
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from '../../../../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import type { ITransactionDetailsContext, TransactionDetailsProviderProps } from './types';
import { ButtonVariant } from '../../../../internal/Button/types';
import { ActiveView } from '../types';

const TransactionDetailsContext = createContext<ITransactionDetailsContext>({
    availableItems: EMPTY_ARRAY,
    primaryAction: noop,
    secondaryAction: noop,
    transaction: EMPTY_OBJECT as ITransactionDetailsContext['transaction'],
});

export const TransactionDetailsProvider = memo(
    ({
        children,
        lineItems,
        refundAvailable,
        refundDisabled,
        setActiveView,
        setPrimaryAction,
        setSecondaryAction,
        transaction,
    }: TransactionDetailsProviderProps) => {
        const { i18n } = useCoreContext();
        const primaryAction = useCallback(() => setActiveView(ActiveView.REFUND), [setActiveView]);
        const secondaryAction = useCallback(noop, []);

        useEffect(() => {
            setPrimaryAction(
                refundAvailable
                    ? Object.freeze({
                          disabled: refundDisabled,
                          event: primaryAction,
                          title: i18n.get('refundAction'),
                          variant: ButtonVariant.PRIMARY,
                      })
                    : undefined
            );
        }, [i18n, primaryAction, refundAvailable, refundDisabled, setPrimaryAction]);

        useEffect(() => {
            setSecondaryAction(undefined);
        }, [secondaryAction]);

        return (
            <TransactionDetailsContext.Provider value={{ availableItems: lineItems, primaryAction, secondaryAction, transaction }}>
                {children}
            </TransactionDetailsContext.Provider>
        );
    }
);

export const useTransactionDetailsContext = () => useContext(TransactionDetailsContext);
export default useTransactionDetailsContext;
