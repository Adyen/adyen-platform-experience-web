import { ITransaction } from '../../../types';
import { IDisputeDetail } from '../../../types/api/models/disputes';
import DisputeStatusTag from '../../external/DisputesOverview/components/DisputesTable/DisputeStatusTag';
import {
    TX_DATA_AMOUNT,
    TX_DATA_LABEL,
    TX_DATA_PAY_METHOD,
    TX_DATA_PAY_METHOD_DETAIL,
    TX_DATA_PAY_METHOD_LOGO,
    TX_DATA_PAY_METHOD_LOGO_CONTAINER,
    TX_DATA_TAGS,
} from '../../external/TransactionDetails/components/constants';
import {
    getAmountStyleForTransaction,
    getDisplayablePaymentMethodForTransaction,
    getPaymentMethodTypeForTransaction,
    getRefundTypeForTransaction,
} from '../../external/TransactionDetails/components/utils';
import cx from 'classnames';
import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { DATE_FORMAT_TRANSACTION_DETAILS } from '../../../constants';
import useCoreContext from '../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../hooks/useTimezoneAwareDateFormatting';
import type { TransactionDataContentProps } from '../../external/TransactionDetails/components/TransactionData/TransactionDataContent';
import { RefundedState, RefundType } from '../../external/TransactionDetails/context/types';
import { Image } from '../Image/Image';
import { TagVariant } from '../Tag/types';
import { Tag } from '../Tag/Tag';

type TransactionStatusBoxProps = Pick<TransactionDataContentProps, 'transaction'> & { refundedState: RefundedState; type: 'transaction' };
type DisputesStatusBoxProps = { dispute: IDisputeDetail; type: 'dispute' };

type StatusBoxProps = DisputesStatusBoxProps | TransactionStatusBoxProps;

const isTransaction = (props: StatusBoxProps): props is TransactionStatusBoxProps => props.type === 'transaction';

const StatusBox = ({ ...props }: StatusBoxProps) => {
    const statusBoxOptions = isTransaction(props)
        ? { refundedState: props.refundedState, transaction: props.transaction }
        : { dispute: props.dispute };
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(statusBoxOptions.transaction?.balanceAccount?.timeZone);
    const { amount, createdAt /*, status*/ } = statusBoxOptions.transaction ?? statusBoxOptions.dispute;
    const { category } = statusBoxOptions.transaction ?? {};

    const formattedAmount = useMemo(() => {
        if (amount) {
            const { currency, value } = amount;
            return `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
        }
    }, [amount, i18n]);

    const transactionOptions = useMemo(
        () =>
            statusBoxOptions?.transaction
                ? [
                      getPaymentMethodTypeForTransaction(statusBoxOptions?.transaction),
                      getDisplayablePaymentMethodForTransaction(statusBoxOptions?.transaction),
                      getRefundTypeForTransaction(statusBoxOptions?.transaction),
                  ]
                : ([] as const),
        [statusBoxOptions.transaction]
    );

    const [paymentMethodType, paymentMethod, refundType] = transactionOptions;

    return (
        <>
            <div className={TX_DATA_TAGS}>
                {/*{status && <Tag label={i18n.get(status)} variant={getTagVariantForTransaction(transaction)} />}*/}
                {category && <Tag label={i18n.get(`txType.${category}`)} variant={TagVariant.DEFAULT} />}
                {statusBoxOptions?.dispute?.status && <DisputeStatusTag item={statusBoxOptions?.dispute}></DisputeStatusTag>}

                {/* refund type: only available for transaction.category == Refund */}
                {refundType && (
                    <>
                        {refundType === RefundType.FULL && <Tag label={i18n.get('full')} variant={TagVariant.SUCCESS} />}
                        {refundType === RefundType.PARTIAL && <Tag label={i18n.get('partial')} variant={TagVariant.BLUE} />}
                    </>
                )}

                {statusBoxOptions?.refundedState === RefundedState.FULL && <Tag label={i18n.get('refunded.full')} variant={TagVariant.SUCCESS} />}
                {statusBoxOptions?.refundedState === RefundedState.PARTIAL && <Tag label={i18n.get('refunded.partial')} variant={TagVariant.BLUE} />}
            </div>

            {formattedAmount && (
                <div
                    className={cx(
                        TX_DATA_AMOUNT,
                        `${TX_DATA_AMOUNT}--${getAmountStyleForTransaction(statusBoxOptions?.transaction as ITransaction)}`
                    )}
                >
                    {formattedAmount}
                </div>
            )}

            {paymentMethodType && (
                <div className={TX_DATA_PAY_METHOD}>
                    <div className={TX_DATA_PAY_METHOD_LOGO_CONTAINER}>
                        <Image className={TX_DATA_PAY_METHOD_LOGO} name={paymentMethodType} alt={paymentMethodType} folder={'logos/'} />
                    </div>

                    <div className={TX_DATA_PAY_METHOD_DETAIL}>{paymentMethod}</div>
                </div>
            )}

            {createdAt && <div className={TX_DATA_LABEL}>{dateFormat(new Date(createdAt), DATE_FORMAT_TRANSACTION_DETAILS)}</div>}
        </>
    );
};

export default memo(StatusBox);
