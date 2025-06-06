import {
    TX_DATA_AMOUNT,
    TX_DATA_LABEL,
    TX_DATA_PAY_METHOD,
    TX_DATA_PAY_METHOD_DETAIL,
    TX_DATA_PAY_METHOD_LOGO,
    TX_DATA_PAY_METHOD_LOGO_CONTAINER,
    TX_DATA_TAGS,
} from '../constants';
import {
    getAmountStyleForTransaction,
    getDisplayablePaymentMethodForTransaction,
    getPaymentMethodTypeForTransaction,
    getRefundTypeForTransaction,
} from '../utils';
import cx from 'classnames';
import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { DATE_FORMAT_TRANSACTION_DETAILS } from '../../../../../constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import type { TransactionDataContentProps } from '../TransactionData/TransactionDataContent';
import type { TranslationKey } from '../../../../../translations';
import { RefundedState, RefundType } from '../../context/types';
import { Image } from '../../../../internal/Image/Image';
import { TagVariant } from '../../../../internal/Tag/types';
import { Tag } from '../../../../internal/Tag/Tag';

type TransactionStatusBoxProps = Pick<TransactionDataContentProps, 'transaction'> & { refundedState: RefundedState };

const TransactionStatusBox = ({ refundedState, transaction }: TransactionStatusBoxProps) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(transaction?.balanceAccount?.timeZone);
    const { amount, category, createdAt /*, status*/ } = transaction;

    const formattedAmount = useMemo(() => {
        const { currency, value } = amount;
        return `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
    }, [amount, i18n]);

    const [paymentMethodType, paymentMethod, refundType] = useMemo(
        () =>
            [
                getPaymentMethodTypeForTransaction(transaction),
                getDisplayablePaymentMethodForTransaction(transaction),
                getRefundTypeForTransaction(transaction),
            ] as const,
        [transaction]
    );

    return (
        <>
            <div className={TX_DATA_TAGS}>
                {/*{status && <Tag label={i18n.get(status)} variant={getTagVariantForTransaction(transaction)} />}*/}
                {category && <Tag label={i18n.get(`txType.${category}`)} variant={TagVariant.DEFAULT} />}

                {/* refund type: only available for transaction.category == Refund */}
                {refundType && (
                    <>
                        {refundType === RefundType.FULL && <Tag label={i18n.get('full')} variant={TagVariant.SUCCESS} />}
                        {refundType === RefundType.PARTIAL && <Tag label={i18n.get('partial')} variant={TagVariant.BLUE} />}
                    </>
                )}

                {refundedState === RefundedState.FULL && <Tag label={i18n.get('refunded.full')} variant={TagVariant.SUCCESS} />}
                {refundedState === RefundedState.PARTIAL && <Tag label={i18n.get('refunded.partial')} variant={TagVariant.BLUE} />}
            </div>

            {formattedAmount && (
                <div className={cx(TX_DATA_AMOUNT, `${TX_DATA_AMOUNT}--${getAmountStyleForTransaction(transaction)}`)}>{formattedAmount}</div>
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

export default memo(TransactionStatusBox);
