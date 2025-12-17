import PaymentRefund from '../PaymentRefund/PaymentRefund';
import PaymentDetails from '../PaymentDetails/PaymentDetails';
import useRefundMetadata from '../../hooks/useRefundMetadata';
import useTransaction from '../../hooks/useTransaction';
import useBalanceAccounts from '../../../../../hooks/useBalanceAccounts';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { IBalanceAccountBase, ILineItem } from '../../../../../types';
import { ActiveView, TransactionDataProps } from '../../types';
import { EMPTY_ARRAY } from '../../../../../utils';
import './TransactionData.scss';

export interface TransactionDataContentProps {
    transaction: NonNullable<TransactionDataProps['transaction']>;
    // TODO - Unify this parameter with dataCustomization
    extraFields: Record<string, any> | undefined;
    balanceAccount?: IBalanceAccountBase;
    dataCustomization?: TransactionDataProps['dataCustomization'];
}

export const TransactionDataContent = ({ transaction: initialTransaction, extraFields, dataCustomization }: TransactionDataContentProps) => {
    const [activeView, setActiveView] = useState(ActiveView.DETAILS);
    const [locked, setLocked] = useState(false);

    const { fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(initialTransaction);
    const { balanceAccounts } = useBalanceAccounts(transaction.balanceAccountId);

    const {
        fullRefundFailed,
        fullRefundInProgress,
        refundableAmount,
        refundAmounts,
        refundAvailable,
        refundCurrency,
        refundDisabled,
        refundedAmount,
        refundedState,
        refundMode,
        refundLocked,
    } = useRefundMetadata(transaction);

    const cachedRefundLocked = useRef(refundLocked);
    const refundIsDisabled = useMemo(() => refundDisabled || locked, [refundDisabled, locked]);
    const refundIsLocked = useMemo(() => refundLocked || locked, [refundLocked, locked]);

    const transactionWithBalanceAccount = useMemo(() => {
        const balanceAccount = balanceAccounts?.find(account => account.id === transaction.balanceAccountId);
        return { ...transaction, balanceAccount } as const;
    }, [balanceAccounts, transaction]);

    const lineItems = useMemo<readonly ILineItem[]>(
        () => Object.freeze(transactionWithBalanceAccount.lineItems ?? EMPTY_ARRAY),
        [transactionWithBalanceAccount.lineItems]
    );

    useEffect(() => {
        if ((cachedRefundLocked.current = refundLocked)) {
            // Refund has been locked while a refund is still in progress
            // Rely only on the refundLocked state
            // Reset the local locked state
            setLocked(false);
        }
    }, [refundLocked]);

    if (fetchingTransaction) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    switch (activeView) {
        case ActiveView.REFUND:
            return (
                <PaymentRefund
                    currency={refundCurrency}
                    disabled={refundIsDisabled}
                    lineItems={lineItems}
                    maxAmount={refundableAmount}
                    mode={refundMode}
                    refreshTransaction={refreshTransaction}
                    refundedAmount={refundedAmount}
                    refundingAmounts={refundAmounts.in_progress ?? EMPTY_ARRAY}
                    setActiveView={setActiveView}
                    setLocked={setLocked}
                    transaction={transactionWithBalanceAccount}
                />
            );

        default:
            return (
                <PaymentDetails
                    dataCustomization={dataCustomization}
                    extraFields={extraFields}
                    fullRefundFailed={fullRefundFailed}
                    fullRefundInProgress={fullRefundInProgress}
                    refundAmounts={refundAmounts}
                    refundAvailable={refundAvailable}
                    refundCurrency={refundCurrency}
                    refundDisabled={refundIsDisabled}
                    refundedAmount={refundedAmount}
                    refundedState={refundedState}
                    refundLocked={refundIsLocked}
                    setActiveView={setActiveView}
                    transaction={transactionWithBalanceAccount}
                    transactionNavigator={transactionNavigator}
                />
            );
    }
};

export default TransactionDataContent;
