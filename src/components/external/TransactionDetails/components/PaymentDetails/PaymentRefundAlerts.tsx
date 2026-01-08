import { memo } from 'preact/compat';
import { ComponentChild } from 'preact';
import { RefundedState } from '../../types';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import { REFUND_STATUSES, TX_REFUND_STATUSES_CONTAINER } from '../../constants';
import { AlertProps, AlertTypeOption, AlertVariantOption } from '../../../../internal/Alert/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Alert from '../../../../internal/Alert/Alert';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';

const baseAlertProps = {
    type: AlertTypeOption.HIGHLIGHT,
    variant: AlertVariantOption.TIP,
} as const;

export interface PaymentRefundAlertsProps {
    fullRefundFailed: boolean;
    fullRefundInProgress: boolean;
    refundAmounts: Readonly<Record<(typeof REFUND_STATUSES)[number], readonly number[] | undefined>>;
    refundCurrency: string;
    refundedAmount: number;
    refundedState: RefundedState;
    refundLocked: boolean;
}

const PaymentRefundAlerts = memo(
    ({
        fullRefundFailed,
        fullRefundInProgress,
        refundAmounts,
        refundCurrency,
        refundedAmount,
        refundedState,
        refundLocked,
    }: PaymentRefundAlertsProps) => {
        const { i18n } = useCoreContext();

        const getFormattedAmountsList = useMemo(() => {
            const listFormatter = new Intl.ListFormat(i18n.locale, { type: 'conjunction' });
            return (amounts: readonly number[]) => listFormatter.format(amounts.map(amount => i18n.amount(amount, refundCurrency)));
        }, [i18n, refundCurrency]);

        const nextAlert = useCallback(<T extends AlertProps>({ description, ...alertProps }: Partial<T>) => {
            console.log(alertProps);
            console.log(baseAlertProps);
            alerts.current.push(
                <Alert {...baseAlertProps} {...alertProps}>
                    <Typography className={'adyen-pe-alert__description'} el={TypographyElement.DIV} variant={TypographyVariant.BODY} wide>
                        {description}
                    </Typography>
                </Alert>
            );
        }, []);

        const alerts = useRef<ComponentChild[]>([]);

        if (refundedState === RefundedState.FULL) {
            nextAlert({ description: i18n.get('transactions.details.refund.alerts.refundedFull') });
        } else {
            if (refundedAmount > 0) {
                const values = { amount: getFormattedAmountsList([refundedAmount]) };
                nextAlert({ description: i18n.get('transactions.details.refund.alerts.refundedAmount', { values }) });
            }

            if (refundLocked) {
                nextAlert({ description: i18n.get('transactions.details.refund.alerts.inProgressBlocked') });
            } else {
                if (refundAmounts.in_progress && refundAmounts.in_progress.length > 0) {
                    if (fullRefundInProgress) {
                        nextAlert({ description: i18n.get('transactions.details.refund.alerts.inProgress') });
                    } else {
                        const values = { amount: getFormattedAmountsList(refundAmounts.in_progress) };
                        nextAlert({ description: i18n.get('transactions.details.refund.alerts.inProgressAmount', { values }) });
                    }
                }

                if (refundAmounts.failed && refundAmounts.failed.length > 0) {
                    const type = AlertTypeOption.WARNING;
                    if (fullRefundFailed) {
                        nextAlert({ type, description: i18n.get('transactions.details.refund.alerts.notPossible') });
                    } else {
                        const values = { amount: getFormattedAmountsList(refundAmounts.failed) };
                        nextAlert({ type, description: i18n.get('transactions.details.refund.alerts.notPossibleAmount', { values }) });
                    }
                }
            }
        }

        useEffect(() => {
            alerts.current = [];
        });

        return alerts.current.length > 0 ? <div className={TX_REFUND_STATUSES_CONTAINER}>{alerts.current}</div> : null;
    }
);

export default PaymentRefundAlerts;
