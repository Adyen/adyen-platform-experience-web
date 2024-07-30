import { useMemo } from 'preact/hooks';
import { TX_DATA_CONTAINER, TX_DATA_LABEL } from '../../constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTransactionDataContext from '../../context';

const TransactionDataProperties = () => {
    const { i18n } = useCoreContext();
    const { transaction } = useTransactionDataContext();

    return useMemo(() => {
        const { balanceAccountDescription, id } = transaction;
        return (
            <>
                {balanceAccountDescription && (
                    <div className={TX_DATA_CONTAINER}>
                        <div className={TX_DATA_LABEL}>{i18n.get('account')}</div>
                        <div>{balanceAccountDescription}</div>
                    </div>
                )}
                <div className={TX_DATA_CONTAINER}>
                    <div className={TX_DATA_LABEL}>{i18n.get('referenceID')}</div>
                    <div aria-label={i18n.get('referenceID')}>{id}</div>
                </div>
            </>
        );
    }, [i18n, transaction]);
};

export default TransactionDataProperties;
