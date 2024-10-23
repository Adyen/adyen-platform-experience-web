import { useMemo } from 'preact/hooks';
import { TX_DATA_LABEL, TX_DATA_SECTION } from '../constants';
import { DATE_FORMAT_TRANSACTION_DETAILS } from '../../../../constants';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import useTransactionDetailsContext from '../context/details';

const TransactionDataDate = () => {
    const { transaction } = useTransactionDetailsContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(transaction?.balanceAccount?.timeZone);

    return useMemo(
        () =>
            transaction ? (
                <div className={`${TX_DATA_SECTION} ${TX_DATA_LABEL}`}>
                    {dateFormat(new Date(transaction.createdAt), DATE_FORMAT_TRANSACTION_DETAILS)}
                </div>
            ) : null,
        [dateFormat, transaction]
    );
};

export default TransactionDataDate;
