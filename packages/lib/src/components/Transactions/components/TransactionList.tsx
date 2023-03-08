import classnames from 'classnames';
import useCoreContext from 'src/core/Context/useCoreContext';
import DataGrid from '../../internal/DataGrid';
import Pagination from '../../internal/Pagination';
import { getLabel } from './utils';
import Button from 'src/components/internal/Button';
import DataGridCell from 'src/components/internal/DataGrid/DataGridCell';
import './Transactions.scss';

function TransactionList(props) {
    const { i18n } = useCoreContext();
    const fields = ['id', 'type', 'balanceAccountId', 'accountHolderId', 'amount', 'createdAt', 'description'];
    const columns = fields.map(key => ({ key, label: i18n.get(getLabel(key)) }));

    return (
        <DataGrid
            columns={columns}
            data={props.transactions.data}
            loading={props.loading}
            customCells={{
                id: (key, item) => (
                   !!props.onTransactionSelected ? (
                        <Button variant={'link'} onClick={() => props.onTransactionSelected({ id: item[key] })}>
                            {item[key]}
                        </Button>
                    ) : (
                        item[key]
                    )
                ),
                balanceAccountId: (key, item) => (
                    !props.onBalanceAccountSelected ? (
                        <Button variant={'link'} onClick={() => props.onBalanceAccountSelected({ id: item[key] })}>
                            {item[key]}
                        </Button>
                    ) : (
                        item[key]
                    )
                ),
                accountHolderId: (key, item) => (
                    !props.onAccountSelected ? (
                        <Button variant={'link'} onClick={() => props.onAccountSelected({ id: item[key] })}>
                            {item[key]}
                        </Button>
                    ) : (
                        item[key]
                    )
                ),
                createdAt: (key, item) => i18n.fullDate(item[key]),
                type: (key, item) => i18n.get(getLabel(item[key])),
                amount: (key, item) => {
                    const amount = item[key]?.currency
                        ? i18n.amount(item[key].value, item[key].currency, { currencyDisplay: 'code', showSign: true })
                        : null;
                    const isPositive = amount?.indexOf('-') === -1;
                    return (
                        <div
                            class={classnames('adyen-fp-amount', {
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
