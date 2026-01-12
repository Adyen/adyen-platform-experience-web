import Tabs from '../../../../../internal/Tabs/Tabs';
import PaymentRefundAlerts from './PaymentRefundAlerts';
import PaymentDetailsActions from './PaymentDetailsActions';
import PaymentDetailsProperties from './PaymentDetailsProperties';
import PaymentDetailsStatusBox from './PaymentDetailsStatusBox';
import { TransactionDataContentProps } from '../TransactionData/TransactionDataContent';
import PaymentDetailsSummary from './PaymentDetailsSummary';
import PaymentDetailsTimeline from './PaymentDetailsTimeline';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { ActiveView, DetailsTab, RefundedState, TransactionDetails, TransactionDetailsProps } from '../../types';
import { REFUND_STATUSES, TX_DATA_CLASS, TX_DATA_CONTAINER, TX_DETAILS_TABS } from '../../constants';
import { TabProps } from '../../../../../internal/Tabs/types';
import { useEffect, useMemo, useState } from 'preact/hooks';

export interface PaymentDetailsProps {
    dataCustomization?: TransactionDetailsProps['dataCustomization'];
    extraFields: Record<string, any> | undefined;
    fullRefundFailed: boolean;
    fullRefundInProgress: boolean;
    refundAmounts: Readonly<Record<(typeof REFUND_STATUSES)[number], readonly number[] | undefined>>;
    refundAvailable: boolean;
    refundCurrency: string;
    refundDisabled: boolean;
    refundedAmount: number;
    refundedState: RefundedState;
    refundLocked: boolean;
    setActiveView: (activeView: ActiveView) => void;
    transaction: TransactionDetails;
    transactionNavigator: TransactionDataContentProps['transactionNavigator'];
}

const PaymentDetails = ({
    dataCustomization,
    extraFields,
    fullRefundFailed,
    fullRefundInProgress,
    refundAmounts,
    refundAvailable,
    refundCurrency,
    refundDisabled,
    refundedAmount,
    refundedState,
    refundLocked,
    setActiveView,
    transaction,
    transactionNavigator,
}: PaymentDetailsProps) => {
    const { i18n } = useCoreContext();
    const [activeTab, setActiveTab] = useState<DetailsTab>();

    const navigationTabs = useMemo(
        () =>
            TX_DETAILS_TABS.filter(({ id }) => {
                switch (id) {
                    case DetailsTab.SUMMARY:
                        const { additions, deductions, originalAmount, amountBeforeDeductions, netAmount } = transaction;
                        return (
                            (additions && additions.length > 0) ||
                            (deductions && deductions.length > 0) ||
                            (originalAmount && originalAmount.value !== amountBeforeDeductions.value) ||
                            netAmount.value !== amountBeforeDeductions.value
                        );
                    case DetailsTab.TIMELINE:
                        return transaction.events && transaction.events.length > 0;
                    default:
                        return true;
                }
            }),
        [transaction]
    );

    const tabContent = useMemo(
        () => ({
            [DetailsTab.DETAILS]: (
                <PaymentDetailsProperties dataCustomization={dataCustomization} extraFields={extraFields} transaction={transaction} />
            ),
            [DetailsTab.SUMMARY]: <PaymentDetailsSummary transaction={transaction} />,
            [DetailsTab.TIMELINE]: <PaymentDetailsTimeline transaction={transaction} />,
        }),
        [dataCustomization, extraFields, transaction]
    );

    useEffect(() => setActiveTab(navigationTabs[0]?.id), [navigationTabs]);

    return (
        <div className={TX_DATA_CLASS}>
            <PaymentDetailsStatusBox refundedState={refundedState} transaction={transaction} />

            <div className={TX_DATA_CONTAINER}>
                {navigationTabs.length > 1 && (
                    <Tabs
                        aria-label={i18n.get('transactions.details.viewSelect.a11y.label')}
                        onChange={({ id }: TabProps<DetailsTab>) => setActiveTab(id)}
                        tabs={navigationTabs}
                        activeTab={activeTab}
                    />
                )}

                {activeTab && tabContent[activeTab]}
            </div>

            <PaymentRefundAlerts
                fullRefundFailed={fullRefundFailed}
                fullRefundInProgress={fullRefundInProgress}
                refundAmounts={refundAmounts}
                refundCurrency={refundCurrency}
                refundedAmount={refundedAmount}
                refundedState={refundedState}
                refundLocked={refundLocked}
            />

            <PaymentDetailsActions
                extraFields={extraFields}
                refundAvailable={refundAvailable}
                refundDisabled={refundDisabled}
                setActiveView={setActiveView}
                transaction={transaction}
                transactionNavigator={transactionNavigator}
            />
        </div>
    );
};

export default PaymentDetails;
