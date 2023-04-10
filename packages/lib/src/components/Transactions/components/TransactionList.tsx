import classnames from 'classnames';
import useCoreContext from 'src/core/Context/useCoreContext';
import DataGrid from '../../internal/DataGrid';
import Pagination from '../../internal/Pagination';
import { getLabel } from './utils';
import Button from 'src/components/internal/Button';
import './Transactions.scss';
import { Transaction, TransactionListProps } from '../types';

function TransactionList(props: TransactionListProps) {
    const { i18n } = useCoreContext();
    const fields: (keyof Transaction)[] = ['id', 'type', 'balanceAccountId', 'accountHolderId', 'amount', 'createdAt', 'description'];

    const columns = fields.map(key => ({ key, label: i18n.get(getLabel(key)) }));

    return (
        <DataGrid<Transaction>
            columns={columns}
            data={props.transactions.data}
            loading={props.loading}
            customCells={{
                id: ({ value }) =>
                    props.onTransactionSelected ? (
                        <Button variant={'link'} onClick={() => props.onTransactionSelected?.({ id: value })}>
                            {value}
                        </Button>
                    ) : (
                        value
                    ),
                balanceAccountId: ({ value }) =>
                    !props.onBalanceAccountSelected ? (
                        <Button variant={'link'} onClick={() => props.onBalanceAccountSelected?.({ id: value })}>
                            {value}
                        </Button>
                    ) : (
                        value
                    ),
                accountHolderId: ({ value }) =>
                    !props.onAccountSelected ? (
                        <Button variant={'link'} onClick={() => props.onAccountSelected?.({ id: value })}>
                            {value}
                        </Button>
                    ) : (
                        value
                    ),
                createdAt: ({ value }) => i18n.fullDate(value),
                type: ({ value }) => i18n.get(getLabel(value)),
                amount: ({ value }) => {
                    const amount = value?.currency ? i18n.amount(value.value, value.currency, { currencyDisplay: 'code', showSign: true }) : null;
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
            {props.showPagination && (
                <DataGrid.Footer>
                    <Pagination page={props.page} hasNextPage={props.hasNextPage} changePage={props.onPageChange} onChange={props.onPageChange} />
                </DataGrid.Footer>
            )}
        </DataGrid>
    );
}

export default TransactionList;
