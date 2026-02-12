import cx from 'classnames';
import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { ActiveView, TransactionDetails } from '../../types';
import { ButtonVariant } from '../../../../internal/Button/types';
import { ButtonActionObject, ButtonActionsLayoutBasic, ButtonActionsList } from '../../../../internal/Button/ButtonActions/types';
import { TX_DATA_ACTION_BAR, TX_DATA_CONTAINER, sharedTransactionDetailsEventProperties } from '../../constants';
import { TransactionDataContentProps } from '../TransactionData/TransactionDataContent';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Icon from '../../../../internal/Icon';

export interface PaymentDetailsActionsProps {
    extraFields: Record<string, any> | undefined;
    refundAvailable: boolean;
    refundDisabled: boolean;
    setActiveView: (activeView: ActiveView) => void;
    transaction: TransactionDetails;
    transactionNavigator: TransactionDataContentProps['transactionNavigator'];
}

const PaymentDetailsActions = ({
    extraFields,
    refundAvailable,
    refundDisabled,
    setActiveView,
    transaction,
    transactionNavigator,
}: PaymentDetailsActionsProps) => {
    const userEvents = useAnalyticsContext();
    const { currentTransaction: currentTransactionId, canNavigateBackward, canNavigateForward, backward, forward } = transactionNavigator;
    const { i18n } = useCoreContext();

    const actionButtons = useMemo(
        () => ({
            backToRefund: { title: i18n.get('transactions.details.actions.backToRefund'), eventLabel: 'Return to refund' } as const,
            goToPayment: { title: i18n.get('transactions.details.actions.goToPayment'), eventLabel: 'Go to payment' } as const,
            refund: { title: i18n.get('transactions.details.actions.refund') } as const,
        }),
        [i18n]
    );

    const transactionNavigation = useMemo<'backToRefund' | 'goToPayment' | undefined>(() => {
        if (currentTransactionId !== transaction.id) return;
        if (canNavigateBackward) return 'backToRefund' satisfies keyof typeof actionButtons;
        if (canNavigateForward) return 'goToPayment' satisfies keyof typeof actionButtons;
    }, [canNavigateBackward, canNavigateForward, currentTransactionId, transaction.id]);

    const primaryAction = useMemo<Readonly<ButtonActionObject> | undefined>(() => {
        if (refundAvailable) {
            return {
                disabled: refundDisabled,
                event: () => {
                    if (!refundDisabled) setActiveView(ActiveView.REFUND);
                },
                title: actionButtons.refund.title,
                variant: ButtonVariant.PRIMARY,
            } as const;
        }
    }, [actionButtons, refundAvailable, refundDisabled, setActiveView]);

    const secondaryAction = useMemo<Readonly<ButtonActionObject> | undefined>(() => {
        if (transactionNavigation) {
            const actionButton = actionButtons[transactionNavigation];
            const isBackNavigation = transactionNavigation === 'backToRefund';
            const transactionNavigationAction = isBackNavigation ? backward : forward;
            return {
                disabled: false,
                event: () => {
                    try {
                        transactionNavigationAction();
                    } finally {
                        userEvents.addEvent?.('Clicked button', {
                            ...sharedTransactionDetailsEventProperties,
                            label: actionButton.eventLabel,
                        });
                    }
                },
                renderTitle: (title: string) => (
                    <>
                        <Icon name="angle-right" style={{ transform: `scaleX(${isBackNavigation ? -1 : 1})` }} />
                        <span>{title}</span>
                    </>
                ),
                title: actionButton.title,
                variant: ButtonVariant.SECONDARY,
            } as const;
        }
    }, [actionButtons, backward, forward, transactionNavigation, userEvents]);

    const customActions = useMemo<ButtonActionsList>(
        () =>
            Object.values(extraFields || [])
                .filter(field => field?.type === 'button')
                .map(action => ({
                    title: action.value,
                    variant: ButtonVariant.SECONDARY,
                    event: action.config?.action,
                    classNames: action.config?.className ? [action.config.className] : [],
                })),
        [extraFields]
    );

    const actions = useMemo(
        () => [primaryAction, secondaryAction, ...customActions].filter(Boolean) as ButtonActionsList,
        [primaryAction, secondaryAction, customActions]
    );

    return actions.length > 0 ? (
        <div className={cx(TX_DATA_CONTAINER, TX_DATA_ACTION_BAR)}>
            <ButtonActions actions={actions} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
        </div>
    ) : null;
};

export default memo(PaymentDetailsActions);
