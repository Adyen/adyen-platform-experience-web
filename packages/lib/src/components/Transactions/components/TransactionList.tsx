import { useMemo } from 'preact/hooks';
import classnames from 'classnames';
import useCoreContext from '@src/core/Context/useCoreContext';
import Alert from '../../internal/Alert';
import DataGrid from '../../internal/DataGrid';
import Pagination from '../../internal/Pagination';
import { getLabel } from './utils';
import Button from '@src/components/internal/Button';
import { TransactionListProps } from '../types';
import { ITransaction } from '../../../types/models/api/transactions';

function TransactionList({
    loading,
    transactions,
    onTransactionSelected,
    onBalanceAccountSelected,
    onAccountSelected,
    showPagination,
    ...paginationProps
}: TransactionListProps) {
    const { i18n } = useCoreContext();
    const fields = ['id', 'type', 'balanceAccountId', 'accountHolderId', 'amount', 'createdAt', 'description'] as const;
    const columns = fields.map(key => ({ key, label: i18n.get(getLabel(key)) }));
    const showAlert = useMemo(() => !(loading || transactions.length), [loading, transactions]);

    return showAlert ? (
        <Alert icon={'cross'}>{i18n.get('unableToLoadTransactions')}</Alert>
    ) : (
        <DataGrid<ITransaction>
            columns={columns}
            data={transactions}
            loading={loading}
            customCells={{
                id: ({ value }) =>
                    onTransactionSelected ? (
                        <Button variant={'link'} onClick={() => onTransactionSelected?.({ id: value })}>
                            {value}
                        </Button>
                    ) : (
                        value
                    ),
                balanceAccountId: ({ value }) =>
                    onBalanceAccountSelected ? (
                        <Button variant={'link'} onClick={() => onBalanceAccountSelected?.({ id: value })}>
                            {value}
                        </Button>
                    ) : (
                        value
                    ),
                accountHolderId: ({ value }) =>
                    onAccountSelected ? (
                        <Button variant={'link'} onClick={() => onAccountSelected?.({ id: value })}>
                            {value}
                        </Button>
                    ) : (
                        value
                    ),
                createdAt: ({ value }) => i18n.fullDate(value),
                type: ({ value }) => value,
                amount: ({ value }) => {
                    const amount = value?.currency
                        ? i18n.amount(value.value, value.currency, {
                              currencyDisplay: 'code',
                              showSign: true,
                          })
                        : null;

                    const isPositive = amount?.indexOf('-') === -1;

                    return (
                        <div
                            className={classnames('adyen-fp-amount', {
                                'adyen-fp-amount--positive': isPositive,
                                'adyen-fp-amount--negative': !isPositive,
                            })}
                        >
                            {amount}
                        </div>
                    );
                },
            }}
        >
            {showPagination && (
                <DataGrid.Footer>
                    <Pagination {...paginationProps} />
                </DataGrid.Footer>
            )}
        </DataGrid>
    );
}

export default TransactionList;
