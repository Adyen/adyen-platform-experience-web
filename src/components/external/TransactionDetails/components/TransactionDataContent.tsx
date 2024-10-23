import cx from 'classnames';
import type { ComponentChild } from 'preact';
import type { PropsWithChildren } from 'preact/compat';
import { EMPTY_ARRAY } from '../../../../utils';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { TransactionDetailsProvider } from '../context/details';
import { TransactionRefundProvider } from '../context/refund';
import TransactionDetailsDataContainer from './TransactionDetailsDataContainer';
import TransactionDataTags from './TransactionDataTags';
import TransactionDataAmount from './TransactionDataAmount';
import TransactionDataPaymentMethod from './TransactionDataPaymentMethod';
import TransactionDataDate from './TransactionDataDate';
import TransactionDataProperties from './TransactionDataProperties';
import { TransactionRefundFullAmountInput, TransactionRefundPartialAmountInput } from './TransactionRefundAmount';
import TransactionRefundNotice from './TransactionRefundNotice';
import TransactionRefundReason from './TransactionRefundReason';
// import TransactionRefundReference from './TransactionRefundReference';
import useRefundCapabilityData from '../context/useRefundCapabilityData';
import { FULLY_REFUNDABLE_ONLY, NON_REFUNDABLE, PARTIALLY_REFUNDABLE_ANY_AMOUNT } from '../context/constants';
import { TX_DATA_ACTION_BAR, TX_DATA_ACTION_BAR_REFUND, TX_DATA_CLASS, TX_DATA_CONTAINER, TX_DATA_CONTAINER_NO_PADDING } from '../constants';
import ButtonActions from '../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonActionObject, ButtonActionsLayoutBasic } from '../../../internal/Button/ButtonActions/types';
import { ActiveView, type TransactionDataProps } from '../context/types';
import type { ILineItem } from '../../../../types';
import './TransactionData.scss';

export type TransactionDataContentProps = Required<Pick<TransactionDataProps, 'transaction'>> & Pick<TransactionDataProps, 'forceHideTitle'>;

const _TransactionDataContentViewWrapper = ({
    children,
    renderViewActionButtons,
}: PropsWithChildren<{ renderViewActionButtons: () => ComponentChild }>) => (
    <div className={TX_DATA_CLASS}>
        {children}
        {renderViewActionButtons()}
    </div>
);

export const TransactionDataContent = ({ forceHideTitle, transaction }: TransactionDataContentProps) => {
    const [activeView, _setActiveView] = useState(ActiveView.DETAILS);
    const [primaryAction, _setPrimaryAction] = useState<ButtonActionObject>();
    const [secondaryAction, _setSecondaryAction] = useState<ButtonActionObject>();

    const {
        availableAmount,
        available: refundAvailable,
        currency: refundCurrency,
        disabled: refundDisabled,
        mode: refundMode,
    } = useRefundCapabilityData(transaction);

    const refundViewAvailable = refundAvailable && !refundDisabled;
    const lineItems: readonly ILineItem[] = Object.freeze(transaction?.lineItems ?? EMPTY_ARRAY);

    const setPrimaryAction = useCallback((action: ButtonActionObject | undefined) => _setPrimaryAction(action), []);
    const setSecondaryAction = useCallback((action: ButtonActionObject | undefined) => _setSecondaryAction(action), []);

    const setActiveView = useCallback(
        (activeView: ActiveView) => {
            if (activeView === ActiveView.REFUND && !refundViewAvailable) return;
            _setActiveView(activeView);
        },
        [refundViewAvailable]
    );

    const renderViewActionButtons = useCallback(() => {
        const actions = [primaryAction!, secondaryAction!].filter(Boolean);
        return actions.length ? (
            <div className={cx(TX_DATA_ACTION_BAR, { [TX_DATA_ACTION_BAR_REFUND]: activeView === ActiveView.REFUND })}>
                <div className={cx(TX_DATA_CONTAINER, TX_DATA_CONTAINER_NO_PADDING)}>
                    <ButtonActions actions={actions} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
                </div>
            </div>
        ) : null;
    }, [activeView, primaryAction, secondaryAction]);

    useEffect(() => {
        if (!refundViewAvailable) _setActiveView(ActiveView.DETAILS);
    }, [refundViewAvailable]);

    useEffect(() => {
        forceHideTitle?.(activeView !== ActiveView.DETAILS);
    }, [activeView, forceHideTitle]);

    if (activeView === ActiveView.REFUND && !refundViewAvailable) return null;

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
                    <TransactionDetailsProvider {...commonContextProviderProps} transaction={transaction}>
                        <TransactionDetailsDataContainer>
                            <TransactionDataTags />
                            <TransactionDataAmount />
                            <TransactionDataPaymentMethod />
                            <TransactionDataDate />
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
                        availableAmount={availableAmount}
                        currency={refundCurrency}
                        refundMode={refundMode}
                        transactionId={transaction.id}
                    >
                        <TransactionRefundNotice />

                        {/* refund amount input */}
                        {refundMode === FULLY_REFUNDABLE_ONLY && <TransactionRefundFullAmountInput />}
                        {refundMode === PARTIALLY_REFUNDABLE_ANY_AMOUNT && <TransactionRefundPartialAmountInput />}

                        {/* additional refund inputs */}
                        {refundMode !== NON_REFUNDABLE && (
                            <>
                                <TransactionRefundReason />
                                {/*<TransactionRefundReference />*/}
                            </>
                        )}
                    </TransactionRefundProvider>
                </_TransactionDataContentViewWrapper>
            );

        default:
            return null;
    }
};

export default TransactionDataContent;
