import { useMemo } from 'preact/hooks';
import { TX_DATA_LABEL, TX_DETAILS_RESERVED_FIELDS_SET } from '../constants';
import { _isCustomDataObject } from '../../../internal/DataGrid/components/TableCells';
import TransactionDetailsDataContainer from './TransactionDetailsDataContainer';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useTransactionDataContext from '../context';

const TransactionDataProperties = () => {
    const { i18n } = useCoreContext();
    const { transaction } = useTransactionDataContext();

    return useMemo(() => {
        const { balanceAccount, id } = transaction;

        const customColumns = Object.entries(transaction)
            .filter(([key]) => !TX_DETAILS_RESERVED_FIELDS_SET.has(key as any))
            .map(([key, value]) => [key, _isCustomDataObject(value) ? value.value : value]);

        return (
            <>
                {balanceAccount?.description && (
                    <TransactionDetailsDataContainer>
                        <div className={TX_DATA_LABEL}>{i18n.get('account')}</div>
                        <div>{balanceAccount.description}</div>
                    </TransactionDetailsDataContainer>
                )}

                <TransactionDetailsDataContainer>
                    <div className={TX_DATA_LABEL}>{i18n.get('referenceID')}</div>
                    <div aria-label={i18n.get('referenceID')}>{id}</div>
                </TransactionDetailsDataContainer>

                {customColumns.map(([key, value]) => (
                    <TransactionDetailsDataContainer key={key}>
                        <div className={TX_DATA_LABEL}>{i18n.get(key as any)}</div>
                        <div aria-label={i18n.get(key as any)}>{value}</div>
                    </TransactionDetailsDataContainer>
                ))}
            </>
        );
    }, [i18n, transaction]);
};

export default TransactionDataProperties;
