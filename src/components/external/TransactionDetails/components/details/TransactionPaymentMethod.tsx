import {
    TX_DATA_PAY_METHOD,
    TX_DATA_PAY_METHOD_DETAIL,
    TX_DATA_PAY_METHOD_LOGO,
    TX_DATA_PAY_METHOD_LOGO_CONTAINER,
    TX_DATA_SECTION,
} from '../constants';
import { useMemo } from 'preact/hooks';
import { Image } from '../../../../internal/Image/Image';
import { getDisplayablePaymentMethodForTransaction, getPaymentMethodTypeForTransaction } from '../utils';
import useTransactionDetailsContext from '../../context/details';

const TransactionPaymentMethod = () => {
    const { transaction } = useTransactionDetailsContext();

    return useMemo(() => {
        const paymentMethodType = getPaymentMethodTypeForTransaction(transaction);
        return paymentMethodType ? (
            <div className={`${TX_DATA_SECTION} ${TX_DATA_PAY_METHOD}`}>
                <div className={TX_DATA_PAY_METHOD_LOGO_CONTAINER}>
                    <Image className={TX_DATA_PAY_METHOD_LOGO} name={paymentMethodType} alt={paymentMethodType} folder={'logos/'} />
                </div>

                <div className={TX_DATA_PAY_METHOD_DETAIL}>{getDisplayablePaymentMethodForTransaction(transaction)}</div>
            </div>
        ) : null;
    }, [transaction]);
};

export default TransactionPaymentMethod;
