import { useMemo } from 'preact/hooks';
import { TX_DATA_LABEL, TX_DATA_SECTION } from '../constants';
import { DATE_FORMAT_TRANSACTION_DETAILS } from '../../../internal/DataOverviewDisplay/constants';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useTransactionDataContext from '../context';

const TransactionDataDate = () => {
    const { i18n } = useCoreContext();
    const { transaction } = useTransactionDataContext();

    return useMemo(
        () =>
            transaction ? (
                <div className={`${TX_DATA_SECTION} ${TX_DATA_LABEL}`}>
                    {i18n.date(new Date(transaction.createdAt), DATE_FORMAT_TRANSACTION_DETAILS).toString()}
                </div>
            ) : null,
        [i18n, transaction]
    );
};

export default TransactionDataDate;
