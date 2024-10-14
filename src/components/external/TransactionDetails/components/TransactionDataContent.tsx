import {
    FULLY_REFUNDABLE_ONLY,
    PARTIALLY_REFUNDABLE_ANY_AMOUNT,
    REFUND_MODES_WITHOUT_OPTIONAL_REFUND_FIELDS,
    REFUND_REASONS,
} from '../context/constants';
import cx from 'classnames';
import { clamp, EMPTY_ARRAY } from '../../../../utils';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { TransactionDetailsProvider } from '../context/details';
import { type ITransactionRefundContext, TransactionRefundProvider } from '../context/refund';
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
import { TX_DATA_ACTION_BAR, TX_DATA_ACTION_BAR_REFUND, TX_DATA_CLASS, TX_DATA_CONTAINER, TX_DATA_CONTAINER_NO_PADDING } from '../constants';
import ButtonActions from '../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonActionObject, ButtonActionsLayoutBasic } from '../../../internal/Button/ButtonActions/types';
import { ActiveView, type RefundReason, type TransactionDataProps } from '../context/types';
import type { ILineItem } from '../../../../types';
import './TransactionData.scss';

export const TransactionDataContent = ({
    forceHideTitle,
    transaction,
}: Required<Pick<TransactionDataProps, 'transaction'>> & Pick<TransactionDataProps, 'forceHideTitle'>) => {
    const [activeView, _setActiveView] = useState(ActiveView.DETAILS);
    const [primaryAction, _setPrimaryAction] = useState<ButtonActionObject>();
    const [secondaryAction, _setSecondaryAction] = useState<ButtonActionObject>();
    const [refundReason, setReason] = useState<RefundReason>(REFUND_REASONS[0]);
    const [refundReference, setReference] = useState<string>();
    const [refundAmount, setRefundAmount] = useState(0);

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

    const setAmount = useCallback<ITransactionRefundContext['setAmount']>(
        amount => {
            if (refundMode !== PARTIALLY_REFUNDABLE_ANY_AMOUNT) return;
            setRefundAmount(clamp(0, amount, availableAmount));
        },
        [availableAmount, refundMode]
    );

    const setRefundReason = useCallback<ITransactionRefundContext['setRefundReason']>(
        reason => {
            if (REFUND_MODES_WITHOUT_OPTIONAL_REFUND_FIELDS.includes(refundMode)) return;
            setReason(reason);
        },
        [refundMode]
    );

    const setRefundReference = useCallback<ITransactionRefundContext['setRefundReference']>(
        reference => {
            if (REFUND_MODES_WITHOUT_OPTIONAL_REFUND_FIELDS.includes(refundMode)) return;
            setReference(reference || undefined);
        },
        [refundMode]
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

    useEffect(() => {
        setRefundAmount(availableAmount);
    }, [availableAmount]);

    switch (activeView) {
        case ActiveView.DETAILS:
        case ActiveView.REFUND: {
            const commonContextProviderProps = {
                lineItems,
                refundAvailable,
                refundDisabled,
                setActiveView,
                setPrimaryAction,
                setSecondaryAction,
            } as const;

            return (
                <div className={TX_DATA_CLASS}>
                    {activeView === ActiveView.DETAILS && (
                        <TransactionDetailsProvider {...commonContextProviderProps} transaction={transaction}>
                            <>
                                <TransactionDetailsDataContainer>
                                    <TransactionDataTags />
                                    <TransactionDataAmount />
                                    <TransactionDataPaymentMethod />
                                    <TransactionDataDate />
                                </TransactionDetailsDataContainer>

                                <TransactionDataProperties />
                            </>
                        </TransactionDetailsProvider>
                    )}

                    {activeView === ActiveView.REFUND && refundViewAvailable && (
                        <TransactionRefundProvider
                            {...commonContextProviderProps}
                            availableAmount={availableAmount}
                            currency={refundCurrency}
                            refundAmount={refundAmount}
                            refundMode={refundMode}
                            refundReason={refundReason}
                            refundReference={refundReference}
                            setAmount={setAmount}
                            setRefundReason={setRefundReason}
                            setRefundReference={setRefundReference}
                        >
                            <>
                                <TransactionRefundNotice />

                                {/* refund amount input */}
                                {refundMode === FULLY_REFUNDABLE_ONLY && <TransactionRefundFullAmountInput />}
                                {refundMode === PARTIALLY_REFUNDABLE_ANY_AMOUNT && <TransactionRefundPartialAmountInput />}

                                {/* additional refund inputs */}
                                {REFUND_MODES_WITHOUT_OPTIONAL_REFUND_FIELDS.includes(refundMode) || (
                                    <>
                                        <TransactionRefundReason />
                                        {/*<TransactionRefundReference />*/}
                                    </>
                                )}
                            </>
                        </TransactionRefundProvider>
                    )}

                    {renderViewActionButtons()}
                </div>
            );
        }

        default:
            return null;
    }
};

export default TransactionDataContent;
