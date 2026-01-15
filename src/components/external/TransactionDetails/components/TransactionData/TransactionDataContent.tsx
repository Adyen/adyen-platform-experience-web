import PaymentRefund from '../PaymentRefund/PaymentRefund';
import PaymentDetails from '../PaymentDetails/PaymentDetails';
import useRefundMetadata from '../../hooks/useRefundMetadata';
import useTransaction from '../../hooks/useTransaction';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import { ActiveView, TransactionDetails, TransactionDetailsProps } from '../../types';
import { useLandedPageEvent } from '../../../../../hooks/useAnalytics/useLandedPageEvent';
import { useMemo, useState } from 'preact/hooks';
import { useModalContext } from '../../../../internal/Modal/Modal';
import { sharedTransactionDetailsEventProperties } from '../../constants';
import { EMPTY_ARRAY } from '../../../../../utils';
import { ILineItem } from '../../../../../types';
import './TransactionData.scss';

type UseTransactionResult = ReturnType<typeof useTransaction>;

export interface TransactionDataContentProps extends Omit<UseTransactionResult, 'error' | 'transaction'> {
    dataCustomization?: TransactionDetailsProps['dataCustomization'];
    extraFields: Record<string, any> | undefined;
    transaction: TransactionDetails;
}

export const TransactionDataContent = ({
    dataCustomization,
    extraFields,
    fetchingTransaction,
    refreshTransaction,
    transaction,
    transactionNavigator,
}: TransactionDataContentProps) => {
    const [activeView, setActiveView] = useState(ActiveView.DETAILS);
    const { withinModal } = useModalContext();

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
        lockRefund,
    } = useRefundMetadata(transaction);

    const lineItems = useMemo<readonly ILineItem[]>(() => Object.freeze(transaction.lineItems ?? EMPTY_ARRAY), [transaction.lineItems]);

    useLandedPageEvent({
        ...sharedTransactionDetailsEventProperties,
        ...(withinModal && { fromPage: 'Transactions overview' }),
    });

    if (fetchingTransaction) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    switch (activeView) {
        case ActiveView.REFUND:
            return (
                <PaymentRefund
                    currency={refundCurrency}
                    disabled={refundDisabled}
                    lineItems={lineItems}
                    lockRefund={lockRefund}
                    maxAmount={refundableAmount}
                    mode={refundMode}
                    refreshTransaction={refreshTransaction}
                    refundedAmount={refundedAmount}
                    refundingAmounts={refundAmounts.in_progress ?? EMPTY_ARRAY}
                    setActiveView={setActiveView}
                    transaction={transaction}
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
                    refundDisabled={refundDisabled}
                    refundedAmount={refundedAmount}
                    refundedState={refundedState}
                    refundLocked={refundLocked}
                    setActiveView={setActiveView}
                    transaction={transaction}
                    transactionNavigator={transactionNavigator}
                />
            );
    }
};

export default TransactionDataContent;
