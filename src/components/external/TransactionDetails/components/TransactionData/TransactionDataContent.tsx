import cx from 'classnames';
import type { ComponentChild } from 'preact';
import type { PropsWithChildren } from 'preact/compat';
import { useCallback, useLayoutEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../hooks/useFetch';
import type { IBalanceAccountBase, ILineItem } from '../../../../../types';
import { EMPTY_ARRAY, EMPTY_OBJECT } from '../../../../../utils';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../internal/Alert/types';
import Button from '../../../../internal/Button';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonActionObject, ButtonActionsLayoutBasic } from '../../../../internal/Button/ButtonActions/types';
import { ButtonVariant } from '../../../../internal/Button/types';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import Icon from '../../../../internal/Icon';
import useStatusBoxData from '../../../../internal/StatusBox/useStatusBox';
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
    TX_DATA_AMOUNT,
    TX_DATA_CLASS,
    TX_REFUND_RESPONSE,
    TX_REFUND_RESPONSE_ERROR_ICON,
    TX_REFUND_RESPONSE_ICON,
    TX_REFUND_RESPONSE_SUCCESS_ICON,
    TX_REFUND_STATUSES_CONTAINER,
    TX_STATUS_BOX,
} from '../constants';
import TransactionDataProperties from '../details/TransactionDataProperties';
import TransactionDetailsDataContainer from '../details/TransactionDetailsDataContainer';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import { TransactionRefundFullAmountInput, TransactionRefundPartialAmountInput } from '../refund/TransactionRefundAmount';
import TransactionRefundNotice from '../refund/TransactionRefundNotice';
import TransactionRefundReason from '../refund/TransactionRefundReason';
import './TransactionData.scss';
import { getAmountStyleForTransaction } from '../utils';
import TransactionStatusTag from './TransactionStatusTag';

export interface TransactionDataContentProps {
    transaction: NonNullable<TransactionDataProps['transaction']>;
    // TODO - Unify this parameter with dataCustomization
    extraFields: Record<string, any> | undefined;
    balanceAccount?: IBalanceAccountBase;
    dataCustomization?: TransactionDataProps['dataCustomization'];
}

const _TransactionDataContentViewWrapper = ({
    children,
    renderViewActionButtons,
    renderViewMessageBox,
}: PropsWithChildren<{ renderViewActionButtons: () => ComponentChild; renderViewMessageBox?: () => ComponentChild }>) => {
    return (
        <div className={TX_DATA_CLASS}>
            {children}
            {renderViewMessageBox && renderViewMessageBox()}
            {renderViewActionButtons()}
        </div>
    );
};

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

export const TransactionDataContent = ({ transaction: initialTransaction, extraFields, dataCustomization }: TransactionDataContentProps) => {
    const [activeView, _setActiveView] = useState(ActiveView.DETAILS);
    const [primaryAction, _setPrimaryAction] = useState<ButtonActionObject>();
    const [secondaryAction, _setSecondaryAction] = useState<ButtonActionObject>();
    //TODO: Remove this when locked status returns from backend
    const [locked, setLocked] = useState(false);

    const { fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(initialTransaction);
    const {
        refundable,
        refundableAmount,
        refundableAmountLabel,
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

    const { getBalanceAccounts: balanceAccountEndpointCall } = useConfigContext().endpoints;

    const { data: balanceAccounts } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!balanceAccountEndpointCall && !transaction.balanceAccount && !!transaction.balanceAccountId,
                    keepPrevData: true,
                },
                queryFn: async () => balanceAccountEndpointCall?.(EMPTY_OBJECT),
            }),
            [transaction.balanceAccountId, transaction.balanceAccount, balanceAccountEndpointCall]
        )
    );

    const setActiveView = useCallback(
        (activeView: ActiveView) => void (shouldPreventActiveViewIfRefund(activeView) || _setActiveView(activeView)),
        [shouldPreventActiveViewIfRefund]
    );

    const renderViewActionButtons = useCallback(() => {
        const extraActions = extraFields
            ? Object.values(extraFields)
                  .filter(field => field.type === 'button')
                  .map(action => ({
                      title: action.value,
                      variant: ButtonVariant.SECONDARY,
                      event: action.config?.action,
                      classNames: action.config?.className ? [action.config.className] : [],
                  }))
            : [];

        const actions = [primaryAction!, secondaryAction!, ...extraActions].filter(Boolean);

        return actions.length ? (
            <TransactionDetailsDataContainer className={TX_DATA_ACTION_BAR}>
                <ButtonActions actions={actions} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
            </TransactionDetailsDataContainer>
        ) : null;
    }, [extraFields, primaryAction, secondaryAction]);

    const onRefundSuccess = useCallback(() => {
        refreshTransaction();
        setLocked(true);
    }, [setLocked, refreshTransaction]);

    const statusBoxProps = {
        timezone: transaction.balanceAccount?.timeZone,
        createdAt: transaction.createdAt,
        amountData: transaction.netAmount,
        paymentMethodData: transaction.paymentMethod,
        bankAccount: transaction.bankAccount,
    } as const;

    const statusBoxOptions = useStatusBoxData(statusBoxProps);

    const renderMessages = useCallback(() => {
        return refundStatuses?.length || refundLocked || locked ? (
            <div className={TX_REFUND_STATUSES_CONTAINER}>
                {(refundLocked || locked) && (
                    <Alert
                        type={AlertTypeOption.HIGHLIGHT}
                        variant={AlertVariantOption.TIP}
                        description={i18n.get('transactions.details.refund.alerts.inProgressBlocked')}
                    />
                )}
                {refundStatuses.map((status, index) => (
                    <Alert
                        key={`${Math.random()}-${index}`}
                        variant={AlertVariantOption.TIP}
                        type={status?.type ?? AlertTypeOption.HIGHLIGHT}
                        description={status?.label}
                    />
                ))}
            </div>
        ) : null;
    }, [i18n, refundStatuses, refundLocked, locked]);

    const balanceAccountData = transaction.balanceAccount ?? balanceAccounts?.data?.find(account => account.id === transaction.balanceAccountId);

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
                    <TransactionDetailsProvider
                        {...commonContextProviderProps}
                        transaction={
                            !transaction.balanceAccount && !!balanceAccountData
                                ? { ...transaction, balanceAccount: balanceAccountData as IBalanceAccountBase }
                                : { ...transaction }
                        }
                        transactionNavigator={transactionNavigator}
                        extraFields={extraFields}
                        dataCustomization={dataCustomization}
                    >
                        <TransactionDetailsDataContainer className={TX_STATUS_BOX}>
                            <StatusBox
                                {...statusBoxOptions}
                                tag={<TransactionStatusTag transaction={transaction} refundedState={refundedState} />}
                                classNames={{ amount: `${TX_DATA_AMOUNT}--${getAmountStyleForTransaction(transaction)}` }}
                            />
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
                        transactionOriginalAmount={transaction.originalAmount}
                    >
                        <TransactionRefundNotice />

                        {/* refund reason selector */}
                        {refundable && <TransactionRefundReason />}

                        {/* refund amount input */}
                        {refundMode === RefundMode.FULL_AMOUNT && <TransactionRefundFullAmountInput />}
                        {(refundMode === RefundMode.PARTIAL_AMOUNT || refundMode === RefundMode.PARTIAL_LINE_ITEMS) && (
                            <TransactionRefundPartialAmountInput locale={i18n.locale} />
                        )}

                        {refundableAmountLabel && (
                            <Alert
                                variant={AlertVariantOption.TIP}
                                type={refundableAmountLabel.type}
                                description={refundableAmountLabel.description}
                            />
                        )}
                    </TransactionRefundProvider>
                </_TransactionDataContentViewWrapper>
            );

        case ActiveView.REFUND_SUCCESS:
            return (
                <_RefundResponseViewWrapper
                    renderIcon={() => <Icon name="checkmark-circle-fill" className={cx(TX_REFUND_RESPONSE_ICON, TX_REFUND_RESPONSE_SUCCESS_ICON)} />}
                    title={i18n.get('transactions.details.refund.alerts.refundSent')}
                    subtitle={i18n.get('transactions.details.refund.alerts.refundSuccess')}
                    action={() => (
                        <Button variant={ButtonVariant.SECONDARY} onClick={onRefundSuccess}>
                            {i18n.get('transactions.details.refund.actions.back')}
                        </Button>
                    )}
                />
            );

        case ActiveView.REFUND_ERROR:
            return (
                <_RefundResponseViewWrapper
                    renderIcon={() => <Icon name="cross-circle-fill" className={cx(TX_REFUND_RESPONSE_ICON, TX_REFUND_RESPONSE_ERROR_ICON)} />}
                    title={i18n.get('common.errors.somethingWentWrong')}
                    subtitle={i18n.get('transactions.details.refund.alerts.refundFailure')}
                    action={() => (
                        <Button variant={ButtonVariant.SECONDARY} onClick={refreshTransaction}>
                            {i18n.get('transactions.details.refund.actions.back')}
                        </Button>
                    )}
                />
            );

        default:
            return null;
    }
};

export default TransactionDataContent;
