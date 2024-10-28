import { useMemo } from 'preact/hooks';
import { TX_DATA_LABEL, TX_DATA_LIST, TX_DETAILS_RESERVED_FIELDS_SET } from '../constants';
import { _isCustomDataObject } from '../../../../internal/DataGrid/components/TableCells';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTransactionDetailsContext from '../../context/details';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListProps } from '../../../../internal/StructuredList/types';
import { EMPTY_OBJECT } from '../../../../../utils';

const TransactionDataProperties = () => {
    const { i18n } = useCoreContext();
    const { transaction } = useTransactionDetailsContext();

    return useMemo(() => {
        const { balanceAccount, id } = transaction;

        const customColumns = Object.entries(transaction)
            .filter(([key]) => !TX_DETAILS_RESERVED_FIELDS_SET.has(key as any))
            .map(([key, value]) => [key, _isCustomDataObject(value) ? value.value : value]);

        const listItems: StructuredListProps['items'] = [
            balanceAccount?.description
                ? { key: 'account', value: balanceAccount.description }
                : (EMPTY_OBJECT as StructuredListProps['items'][number]),
            ...customColumns.map(([key, value]) => ({ key, value })),
            { key: 'referenceID', value: id },
        ];

        return (
            <StructuredList
                className={TX_DATA_LIST}
                items={listItems}
                layout="4-8"
                renderLabel={label => <div className={TX_DATA_LABEL}>{label}</div>}
            />
        );
    }, [i18n, transaction]);
};

export default TransactionDataProperties;
