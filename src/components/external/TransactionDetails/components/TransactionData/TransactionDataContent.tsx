import type { ComponentChild } from 'preact';
import type { PropsWithChildren } from 'preact/compat';
import { EMPTY_ARRAY } from '../../../../../utils';
import { useCallback, useLayoutEffect, useState } from 'preact/hooks';
import { TransactionDetailsProvider } from '../../context/details';
import { TransactionRefundProvider } from '../../context/refund';
import TransactionDetailsDataContainer from '../details/TransactionDetailsDataContainer';
import TransactionDataProperties from '../details/TransactionDataProperties';
import TransactionStatusBox from '../details/TransactionStatusBox';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import { TransactionRefundFullAmountInput, TransactionRefundPartialAmountInput } from '../refund/TransactionRefundAmount';
import TransactionRefundNotice from '../refund/TransactionRefundNotice';
import TransactionRefundReason from '../refund/TransactionRefundReason';
import useTransaction from '../../hooks/useTransaction';
import useTransactionRefundMetadata from '../../hooks/useTransactionRefundMetadata';
import { TX_DATA_ACTION_BAR, TX_DATA_CLASS, TX_STATUS_BOX } from '../constants';
import { ButtonActionObject, ButtonActionsLayoutBasic } from '../../../../internal/Button/ButtonActions/types';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { ActiveView, RefundMode } from '../../context/types';
import type { TransactionDataProps } from '../../types';
import type { ILineItem } from '../../../../../types';
import './TransactionData.scss';
import TransactionLineItems from '../TransactionLineItem/TransactionLineItems';

export interface TransactionDataContentProps {
    transaction: NonNullable<TransactionDataProps['transaction']>;
}

const _TransactionDataContentViewWrapper = ({
    children,
    renderViewActionButtons,
}: PropsWithChildren<{ renderViewActionButtons: () => ComponentChild }>) => (
    <div className={TX_DATA_CLASS}>
        {children}
        {/* renderViewMessageBox() */}
        {renderViewActionButtons()}
    </div>
);

export const TransactionDataContent = ({ transaction: initialTransaction }: TransactionDataContentProps) => {
    const [activeView, _setActiveView] = useState(ActiveView.DETAILS);
    const [primaryAction, _setPrimaryAction] = useState<ButtonActionObject>();
    const [secondaryAction, _setSecondaryAction] = useState<ButtonActionObject>();

    const { fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(initialTransaction);
    const { refundable, refundableAmount, refundAvailable, refundCurrency, refundDisabled, refundedState, refundMode } =
        useTransactionRefundMetadata(transaction);

    const lineItems: readonly ILineItem[] = Object.freeze(transaction?.lineItems ?? EMPTY_ARRAY);

    const setPrimaryAction = useCallback((action: ButtonActionObject | undefined) => _setPrimaryAction(action), []);
    const setSecondaryAction = useCallback((action: ButtonActionObject | undefined) => _setSecondaryAction(action), []);

    const shouldPreventActiveViewIfRefund = useCallback(
        (activeView: ActiveView) => activeView === ActiveView.REFUND && refundDisabled,
        [refundDisabled]
    );

    const setActiveView = useCallback(
        (activeView: ActiveView) => void (shouldPreventActiveViewIfRefund(activeView) || _setActiveView(activeView)),
        [shouldPreventActiveViewIfRefund]
    );

    const renderViewActionButtons = useCallback(() => {
        const actions = [primaryAction!, secondaryAction!].filter(Boolean);
        return actions.length ? (
            <TransactionDetailsDataContainer className={TX_DATA_ACTION_BAR}>
                <ButtonActions actions={actions} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
            </TransactionDetailsDataContainer>
        ) : null;
    }, [primaryAction, secondaryAction]);

    useLayoutEffect(() => {
        _setActiveView(ActiveView.DETAILS);
    }, [transaction]);

    useLayoutEffect(() => {
        if (refundDisabled) _setActiveView(ActiveView.DETAILS);
    }, [refundDisabled]);

    if (fetchingTransaction) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    if (shouldPreventActiveViewIfRefund(activeView)) return null;

    const commonContextProviderProps = {
        lineItems,
        refundAvailable,
        refundDisabled,
        setActiveView,
        setPrimaryAction,
        setSecondaryAction,
    } as const;

    switch (activeView) {
        case ActiveView.DETAILS:
            return (
                <_TransactionDataContentViewWrapper renderViewActionButtons={renderViewActionButtons}>
                    <TransactionDetailsProvider {...commonContextProviderProps} transaction={transaction} transactionNavigator={transactionNavigator}>
                        <TransactionDetailsDataContainer className={TX_STATUS_BOX}>
                            <TransactionStatusBox transaction={transaction} refundedState={refundedState} />
                        </TransactionDetailsDataContainer>

                        <TransactionDataProperties />
                        {transaction?.lineItems && transaction?.lineItems.length > 0 && <TransactionLineItems view={ActiveView.DETAILS} />}
                    </TransactionDetailsProvider>
                </_TransactionDataContentViewWrapper>
            );

        case ActiveView.REFUND:
            return (
                <_TransactionDataContentViewWrapper renderViewActionButtons={renderViewActionButtons}>
                    <TransactionRefundProvider
                        {...commonContextProviderProps}
                        availableAmount={refundableAmount}
                        currency={refundCurrency}
                        refundMode={refundMode}
                        refreshTransaction={refreshTransaction}
                        transactionId={transaction.id}
                    >
                        <TransactionRefundNotice />

                        {/* refund reason selector */}
                        {refundable && <TransactionRefundReason />}

                        {/* refund amount input */}
                        {refundMode === RefundMode.FULL_AMOUNT && <TransactionRefundFullAmountInput />}
                        {(refundMode === RefundMode.PARTIAL_AMOUNT || refundMode === RefundMode.PARTIAL_LINE_ITEMS) && (
                            <TransactionRefundPartialAmountInput />
                        )}
                    </TransactionRefundProvider>
                </_TransactionDataContentViewWrapper>
            );

        default:
            return null;
    }
};

export default TransactionDataContent;
