import cx from 'classnames';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import useStatusBoxData from '../../../../internal/StatusBox/useStatusBox';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { getTransactionCategory } from '../../../../utils/translation/getters';
import { getAmountStyleForTransaction, getRefundTypeForTransaction } from '../../utils';
import { TX_DATA_AMOUNT, TX_DATA_CONTAINER, TX_DATA_TAGS, TX_STATUS_BOX } from '../../constants';
import { RefundedState, RefundType, TransactionDetails } from '../../types';
import { TagVariant } from '../../../../internal/Tag/types';
import { Tag } from '../../../../internal/Tag/Tag';
import { useMemo } from 'preact/hooks';
import { memo } from 'preact/compat';

export interface PaymentDetailsStatusBoxProps {
    refundedState: RefundedState;
    transaction: TransactionDetails;
}

const PaymentDetailsStatusBox = ({ refundedState, transaction }: PaymentDetailsStatusBoxProps) => {
    const statusBoxOptions = useStatusBoxData({
        timezone: transaction.balanceAccount?.timeZone,
        createdAt: transaction.createdAt,
        amountData: transaction.netAmount,
        paymentMethodData: transaction.paymentMethod,
        bankAccount: transaction.bankAccount,
    });

    const statusBoxClassNames = useMemo(
        () => ({
            amount: `${TX_DATA_AMOUNT}--${getAmountStyleForTransaction(transaction)}`,
        }),
        [transaction]
    );

    const statusBoxTags = useMemo(
        () => <PaymentDetailsStatusBox.StatusTags transaction={transaction} refundedState={refundedState} />,
        [transaction, refundedState]
    );

    return (
        <div className={cx(TX_DATA_CONTAINER, TX_STATUS_BOX)}>
            <StatusBox {...statusBoxOptions} classNames={statusBoxClassNames} tag={statusBoxTags} />
        </div>
    );
};

PaymentDetailsStatusBox.StatusTags = memo(({ transaction, refundedState }: PaymentDetailsStatusBoxProps) => {
    const { i18n } = useCoreContext();
    const { category } = transaction;

    const refundType = getRefundTypeForTransaction(transaction);

    return (
        <div className={TX_DATA_TAGS}>
            {/*{status && <Tag label={getTransactionStatus(i18n, status)} variant={getTagVariantForTransaction(transaction)} />}*/}
            {category && <Tag label={getTransactionCategory(i18n, category)} variant={TagVariant.DEFAULT} />}

            {/* refund type: only available for transaction.category == Refund */}
            {refundType && (
                <>
                    {refundType === RefundType.FULL && (
                        <Tag label={i18n.get('transactions.details.common.refundTypes.full')} variant={TagVariant.SUCCESS} />
                    )}
                    {refundType === RefundType.PARTIAL && (
                        <Tag label={i18n.get('transactions.details.common.refundTypes.partial')} variant={TagVariant.BLUE} />
                    )}
                </>
            )}

            {refundedState === RefundedState.FULL && (
                <Tag label={i18n.get('transactions.details.common.refundedStates.full')} variant={TagVariant.SUCCESS} />
            )}
            {refundedState === RefundedState.PARTIAL && (
                <Tag label={i18n.get('transactions.details.common.refundedStates.partial')} variant={TagVariant.BLUE} />
            )}
        </div>
    );
});

export default memo(PaymentDetailsStatusBox);
