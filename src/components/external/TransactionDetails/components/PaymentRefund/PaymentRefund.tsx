import {
    REFUND_REASONS,
    TX_DATA_CLASS,
    TX_REFUND_RESPONSE,
    TX_REFUND_RESPONSE_ERROR_ICON,
    TX_REFUND_RESPONSE_ICON,
    TX_REFUND_RESPONSE_SUCCESS_ICON,
    sharedTransactionDetailsEventProperties,
} from '../../constants';
import { memo } from 'preact/compat';
import { clamp } from '../../../../../utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useComponentTiming from '../../../../../hooks/useComponentTiming';
// import useRefundLineItems from '../../hooks/useRefundLineItems';
import PaymentRefundActions from './PaymentRefundActions';
import PaymentRefundAmount from './PaymentRefundAmount';
import PaymentRefundNotice from './PaymentRefundNotice';
import PaymentRefundReason from './PaymentRefundReason';
import Alert from '../../../../internal/Alert/Alert';
import Button from '../../../../internal/Button/Button';
import Typography from '../../../../internal/Typography/Typography';
import { ActiveView, RefundMode, RefundReason, RefundResult, TransactionDetails } from '../../types';
import { TypographyElement, TypographyModifier, TypographyVariant } from '../../../../internal/Typography/types';
import { AlertTypeOption, AlertVariantOption } from '../../../../internal/Alert/types';
import { ButtonVariant } from '../../../../internal/Button/types';
import { ILineItem, IRefundMode } from '../../../../../types';
import { TranslationKey } from '../../../../../translations';
import { IconName } from '../../../../internal/Icon/Icon';
import Icon from '../../../../internal/Icon';
import cx from 'classnames';

export interface PaymentRefundProps {
    currency: string;
    disabled: boolean;
    lineItems: readonly ILineItem[];
    maxAmount: number;
    mode: IRefundMode;
    refreshTransaction: () => void;
    refundedAmount: number;
    refundingAmounts: readonly number[];
    setActiveView: (activeView: ActiveView) => void;
    setLocked: (locked: boolean) => void;
    transaction: TransactionDetails;
}

interface PaymentRefundFormProps extends Omit<PaymentRefundProps, 'disabled' | 'refreshTransaction' | 'setActiveView' | 'setLocked'> {
    beginRefund: () => void;
    setRefundResult: (result: RefundResult) => void;
    showDetails: () => void;
}

interface PaymentRefundResultProps extends Pick<PaymentRefundProps, 'refreshTransaction'> {
    result: RefundResult;
    showDetails: () => void;
}

const PaymentRefund = ({ disabled, refreshTransaction, setActiveView, setLocked, ...formProps }: PaymentRefundProps) => {
    const [refundResult, setRefundResult] = useState<RefundResult>();
    const beginRefund = useCallback(() => void (initiatedRefund.current = true), []);
    const lockRefunds = useCallback(() => setLocked(true), [setLocked]);
    const showDetails = useCallback(() => setActiveView(ActiveView.DETAILS), [setActiveView]);

    const { duration } = useComponentTiming();
    const loggedEntryEvent = useRef(false);
    const initiatedRefund = useRef(false);
    const userEvents = useAnalyticsContext();

    useEffect(() => {
        if (!loggedEntryEvent.current) {
            loggedEntryEvent.current = true;
            userEvents.addEvent?.('Switched to refund view', sharedTransactionDetailsEventProperties);
        }
    }, [userEvents]);

    useEffect(() => {
        if (disabled && !refundResult) showDetails();
        if (refundResult === 'done') lockRefunds();
    }, [disabled, lockRefunds, refundResult, showDetails]);

    useEffect(() => {
        return () => {
            if (duration.current !== undefined && !initiatedRefund.current) {
                // This component is unmounting (duration.current is defined),
                // and a refund was not initiated (initiatedRefund.current is false),
                // indicating an abrupt termination of the refund flow.
                userEvents.addEvent?.('Cancelled refund', sharedTransactionDetailsEventProperties);
            }
        };
    }, [duration, userEvents]);

    return refundResult ? (
        <PaymentRefund.Result result={refundResult} refreshTransaction={refreshTransaction} showDetails={showDetails} />
    ) : (
        <PaymentRefund.Form {...formProps} beginRefund={beginRefund} setRefundResult={setRefundResult} showDetails={showDetails} />
    );
};

PaymentRefund.Form = memo(
    ({
        beginRefund,
        currency,
        maxAmount,
        mode,
        refundedAmount,
        refundingAmounts,
        setRefundResult,
        showDetails,
        transaction,
    }: PaymentRefundFormProps) => {
        const [refundInProgress, setRefundInProgress] = useState(false);
        const [refundReason, setRefundReason] = useState<RefundReason>(REFUND_REASONS[0]);
        const [refundAmount, setRefundAmount] = useState(0);

        // const { refundingItems } = useRefundLineItems({ currency, lineItems });
        const { i18n } = useCoreContext();

        const amount = useMemo(() => {
            switch (mode) {
                case RefundMode.FULL_AMOUNT:
                case RefundMode.PARTIAL_AMOUNT:
                case RefundMode.PARTIAL_LINE_ITEMS:
                    return maxAmount;
                // case RefundMode.PARTIAL_LINE_ITEMS:
                //     return refundingItems.reduce((total, { amount, quantity }) => total + amount * quantity, 0);
                default:
                    return 0;
            }
        }, [maxAmount, mode]);

        const maxAmountAlert = useMemo(() => {
            if (maxAmount > 0) {
                const values = { amount: i18n.amount(maxAmount, currency) };
                switch (mode) {
                    case RefundMode.FULL_AMOUNT:
                        return i18n.get('transactions.details.refund.alerts.refundableAmount', { values });
                    case RefundMode.PARTIAL_AMOUNT:
                        return i18n.get('transactions.details.refund.alerts.refundableMaximum', { values });
                }
            }
        }, [i18n, currency, maxAmount, mode]);

        return (
            <div className={TX_DATA_CLASS}>
                <PaymentRefundNotice />
                <PaymentRefundReason disabled={refundInProgress} reason={refundReason} onChange={setRefundReason} />

                <PaymentRefundAmount
                    currency={currency}
                    disabled={refundInProgress || mode !== RefundMode.PARTIAL_AMOUNT}
                    onChange={value => setRefundAmount(clamp(0, value, amount))}
                    value={amount}
                />

                {maxAmountAlert && (
                    <Alert variant={AlertVariantOption.TIP} type={AlertTypeOption.HIGHLIGHT}>
                        <Typography className={'adyen-pe-alert__description'} el={TypographyElement.DIV} variant={TypographyVariant.BODY} wide>
                            {maxAmountAlert}
                        </Typography>
                    </Alert>
                )}

                <PaymentRefundActions
                    beginRefund={beginRefund}
                    currency={currency}
                    disabled={refundInProgress}
                    maxAmount={maxAmount}
                    refundAmount={refundAmount}
                    refundedAmount={refundedAmount}
                    refundingAmounts={refundingAmounts}
                    refundReason={refundReason}
                    setRefundInProgress={setRefundInProgress}
                    setRefundResult={setRefundResult}
                    showDetails={showDetails}
                    transactionId={transaction.id}
                />
            </div>
        );
    }
);

PaymentRefund.Result = memo(({ result, refreshTransaction, showDetails }: PaymentRefundResultProps) => {
    const { i18n } = useCoreContext();

    const { isErrorResult, iconName, titleKey, descriptionKey } = useMemo(() => {
        let iconName: IconName = 'checkmark-circle-fill';
        let titleKey: TranslationKey = 'transactions.details.refund.alerts.refundSent';
        let descriptionKey: TranslationKey = 'transactions.details.refund.alerts.refundSuccess';

        const isErrorResult = result === 'error';

        if (isErrorResult) {
            iconName = 'cross-circle-fill';
            titleKey = 'common.errors.somethingWentWrong';
            descriptionKey = 'transactions.details.refund.alerts.refundFailure';
        }

        return { isErrorResult, iconName, titleKey, descriptionKey } as const;
    }, [result]);

    return (
        <div className={TX_REFUND_RESPONSE}>
            <Icon
                className={cx(TX_REFUND_RESPONSE_ICON, {
                    [TX_REFUND_RESPONSE_ERROR_ICON]: isErrorResult,
                    [TX_REFUND_RESPONSE_SUCCESS_ICON]: !isErrorResult,
                })}
                name={iconName}
            />
            <Typography className={TypographyModifier.MEDIUM} variant={TypographyVariant.TITLE}>
                {i18n.get(titleKey)}
            </Typography>
            <Typography variant={TypographyVariant.BODY}>{i18n.get(descriptionKey)}</Typography>
            <Button
                onClick={() => {
                    showDetails();
                    refreshTransaction();
                }}
                variant={ButtonVariant.SECONDARY}
            >
                {i18n.get('transactions.details.refund.actions.back')}
            </Button>
        </div>
    );
});

export default PaymentRefund;
