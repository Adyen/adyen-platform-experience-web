import { useMemo } from 'preact/hooks';
import { getAmountStyleForTransaction } from '../utils';
import { TX_DATA_AMOUNT, TX_DATA_SECTION } from '../constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTransactionDetailsContext from '../../context/details';

const TransactionDataAmount = () => {
    const { i18n } = useCoreContext();
    const { transaction } = useTransactionDetailsContext();

    return useMemo(() => {
        const className = `${TX_DATA_SECTION} ${TX_DATA_AMOUNT} ${TX_DATA_AMOUNT}--${getAmountStyleForTransaction(transaction)}`;
        let displayAmount: string | null = null;

        if (transaction.amount) {
            const { currency, value } = transaction.amount;
            displayAmount = `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
        }

        return <div className={className}>{displayAmount}</div>;
    }, [i18n, transaction]);
};

export default TransactionDataAmount;
