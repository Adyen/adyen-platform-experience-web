import cx from 'classnames';
import type { ComponentChild } from 'preact';
import type { PropsWithChildren } from 'preact/compat';
import { useCallback, useLayoutEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import type { ILineItem } from '../../../../../types';
import { EMPTY_ARRAY } from '../../../../../utils';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Button from '../../../../internal/Button';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonActionObject, ButtonActionsLayoutBasic } from '../../../../internal/Button/ButtonActions/types';
import { ButtonVariant } from '../../../../internal/Button/types';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import Icon from '../../../../internal/Icon';
import { TypographyModifier, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { TransactionDetailsProvider } from '../../context/details';
import { TransactionRefundProvider } from '../../context/refund';
import { ActiveView, RefundMode } from '../../context/types';
import useTransaction from '../../hooks/useTransaction';
import useTransactionRefundMetadata from '../../hooks/useTransactionRefundMetadata';
import type { TransactionDataProps } from '../../types';
import {
    TX_DATA_ACTION_BAR,
    TX_DATA_CLASS,
    TX_REFUND_RESPONSE,
    TX_REFUND_RESPONSE_ERROR_ICON,
    TX_REFUND_RESPONSE_ICON,
    TX_REFUND_RESPONSE_SUCCESS_ICON,
    TX_STATUS_BOX,
} from '../constants';
import TransactionDataProperties from '../details/TransactionDataProperties';
import TransactionDetailsDataContainer from '../details/TransactionDetailsDataContainer';
import TransactionStatusBox from '../details/TransactionStatusBox';
import { TransactionRefundFullAmountInput, TransactionRefundPartialAmountInput } from '../refund/TransactionRefundAmount';
import TransactionRefundNotice from '../refund/TransactionRefundNotice';
import TransactionRefundReason from '../refund/TransactionRefundReason';
import './TransactionData.scss';

export interface TransactionDataContentProps {
    transaction: NonNullable<TransactionDataProps['transaction']>;
}

const _TransactionDataContentViewWrapper = ({
    children,
    renderViewActionButtons,
    renderViewMessageBox,
}: PropsWithChildren<{ renderViewActionButtons: () => ComponentChild; renderViewMessageBox?: () => ComponentChild }>) => (
    <div className={TX_DATA_CLASS}>
        {children}
        {renderViewMessageBox && renderViewMessageBox()}
        {renderViewActionButtons()}
    </div>
);

const _RefundResponseViewWrapper = ({
    action,
    title,
    renderIcon,
    subtitle,
}: {
    title: string;
    subtitle: string;
    renderIcon?: () => ComponentChild;
    action: () => ComponentChild;
}) => (
    <div className={TX_REFUND_RESPONSE}>
        {renderIcon && renderIcon()}
        <Typography className={TypographyModifier.MEDIUM} variant={TypographyVariant.TITLE}>
            {title}
        </Typography>
        <Typography variant={TypographyVariant.BODY}>{subtitle}</Typography>
        {action && action()}
    </div>
);

export const TransactionDataContent = ({ transaction: initialTransaction }: TransactionDataContentProps) => {
    const [activeView, _setActiveView] = useState(ActiveView.DETAILS);
    const [primaryAction, _setPrimaryAction] = useState<ButtonActionObject>();
    const [secondaryAction, _setSecondaryAction] = useState<ButtonActionObject>();
    //TODO: Remove this when locked status returns from backend
    const [locked, setLocked] = useState(false);

    const { fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(initialTransaction);
    const {
        refundable,
        refundableAmount,
        refundAvailable,
        refundCurrency,
        refundDisabled: refundDisabledMetaData,
        refundedState,
        refundStatuses,
        refundMode,
        refundLocked,
    } = useTransactionRefundMetadata(transaction);

    //TODO: Remove this and do not rename refundDetails from the hook when locked status returns from backend
    const refundDisabled = useMemo(() => refundDisabledMetaData || locked, [refundDisabledMetaData, locked]);

    const { i18n } = useCoreContext();
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

    const onRefundSuccess = useCallback(() => {
        console.log('hey');
        setLocked(true);
        refreshTransaction();
    }, [setLocked, refreshTransaction]);

    const renderMessages = useCallback(() => {
        // TODO:Add translation
        return refundStatuses?.length || refundLocked || locked ? (
            <>
                {(refundLocked || locked) && (
                    <Alert type={AlertTypeOption.HIGHLIGHT} description={'The refund is being processed. Please come back later.'} />
                )}
                {refundStatuses.map((status, index) => (
                    <Alert key={`${Math.random()}-${index}`} type={status?.type ?? AlertTypeOption.HIGHLIGHT} description={status?.label} />
                ))}
            </>
        ) : null;
    }, [refundStatuses, refundLocked, locked]);

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
                <_TransactionDataContentViewWrapper renderViewActionButtons={renderViewActionButtons} renderViewMessageBox={renderMessages}>
                    <TransactionDetailsProvider {...commonContextProviderProps} transaction={transaction} transactionNavigator={transactionNavigator}>
                        <TransactionDetailsDataContainer className={TX_STATUS_BOX}>
                            <TransactionStatusBox transaction={transaction} refundedState={refundedState} />
                        </TransactionDetailsDataContainer>

                        <TransactionDataProperties />
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

        case ActiveView.REFUND_SUCCESS:
            return (
                <_RefundResponseViewWrapper
                    renderIcon={() => <Icon name="checkmark-circle-fill" className={cx(TX_REFUND_RESPONSE_ICON, TX_REFUND_RESPONSE_SUCCESS_ICON)} />}
                    title={i18n.get('refundActionSuccessTitle')}
                    subtitle={i18n.get('refundActionSuccessSubtitle')}
                    action={() => (
                        <Button variant={ButtonVariant.SECONDARY} onClick={onRefundSuccess}>
                            {i18n.get('goToPayment')}
                        </Button>
                    )}
                />
            );

        case ActiveView.REFUND_ERROR:
            return (
                <_RefundResponseViewWrapper
                    renderIcon={() => <Icon name="cross-circle-fill" className={cx(TX_REFUND_RESPONSE_ICON, TX_REFUND_RESPONSE_ERROR_ICON)} />}
                    title={i18n.get('refundActionErrorTitle')}
                    subtitle={i18n.get('refundActionErrorSubtitle')}
                    action={() => (
                        <Button variant={ButtonVariant.SECONDARY} onClick={refreshTransaction}>
                            {i18n.get('goToPayment')}
                        </Button>
                    )}
                />
            );

        default:
            return null;
    }
};

export default TransactionDataContent;
