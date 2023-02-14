import { h } from 'preact';
import classnames from 'classnames';
import useCoreContext from 'src/core/Context/useCoreContext';
import DataGrid from '../../internal/DataGrid';
import Pagination from '../../internal/Pagination';
import { getLabel } from './utils';
import Button from 'src/components/internal/Button';
import DataGridCell from 'src/components/internal/DataGrid/DataGridCell';
import './Transactions.scss';

function Transactions(props) {
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
                    <DataGridCell key={key}>
                        {!!props.onTransactionSelected ? (
                            <Button variant={'link'} onClick={() => props.onTransactionSelected({ id: item[key] })}>
                                {item[key]}
                            </Button>
                        ) : (
                            item[key]
                        )}
                    </DataGridCell>
                ),
                balanceAccountId: (key, item) => (
                    <DataGridCell key={key}>
                        {!!props.onBalanceAccountSelected ? (
                            <Button variant={'link'} onClick={() => props.onBalanceAccountSelected({ id: item[key] })}>
                                {item[key]}
                            </Button>
                        ) : (
                            item[key]
                        )}
                    </DataGridCell>
                ),
                accountHolderId: (key, item) => (
                    <DataGridCell key={key}>
                        {!!props.onAccountSelected ? (
                            <Button variant={'link'} onClick={() => props.onAccountSelected({ id: item[key] })}>
                                {item[key]}
                            </Button>
                        ) : (
                            item[key]
                        )}
                    </DataGridCell>
                ),
                createdAt: (key, item) => <DataGridCell key={key}>{i18n.fullDate(item[key])}</DataGridCell>,
                type: (key, item) => <DataGridCell key={key}>{i18n.get(getLabel(item[key]))}</DataGridCell>,
                amount: (key, item) => {
                    const amount = item[key]?.currency
                        ? i18n.amount(item[key].value, item[key].currency, { currencyDisplay: 'code', showSign: true })
                        : null;
                    const isPositive = amount && amount.indexOf('-') === -1;
                    return (
                        <DataGridCell key={key}>
                            <div
                                class={classnames('adyen-fp-amount', {
                                    'adyen-fp-amount--positive': isPositive,
                                    'adyen-fp-amount--negative': !isPositive,
                                })}
                            >
                                {amount}
                            </div>
                        </DataGridCell>
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

export default Transactions;
