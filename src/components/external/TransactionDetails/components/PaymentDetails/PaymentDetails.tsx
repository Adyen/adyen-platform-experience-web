import PaymentRefundAlerts from './PaymentRefundAlerts';
import PaymentDetailsActions from './PaymentDetailsActions';
import PaymentDetailsProperties from './PaymentDetailsProperties';
import PaymentDetailsStatusBox from './PaymentDetailsStatusBox';
import { REFUND_STATUSES, TX_DATA_CLASS, TX_DATA_CONTAINER } from '../../constants';
import { TransactionDataContentProps } from '../TransactionData/TransactionDataContent';
import { ActiveView, RefundedState, TransactionDetails, TransactionDetailsProps } from '../../types';

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
    return (
        <div className={TX_DATA_CLASS}>
            <PaymentDetailsStatusBox refundedState={refundedState} transaction={transaction} />

            <div className={TX_DATA_CONTAINER}>
                <PaymentDetailsProperties dataCustomization={dataCustomization} extraFields={extraFields} transaction={transaction} />
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
