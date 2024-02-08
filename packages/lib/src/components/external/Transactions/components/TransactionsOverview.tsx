import { TransactionsComponentProps } from '../types';
import { ExternalUIComponentProps } from '../../../types';
import './TransactionList.scss';
import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { TransactionListContainer } from '@src/components/external/Transactions/components/TransactionListContainer';
import { useMemo } from 'preact/hooks';

function TransactionsOverviewComponent(props: ExternalUIComponentProps<TransactionsComponentProps>) {
    // Balance Accounts
    const balanceAccountEndpointCall = useSetupEndpoint('getBalanceAccounts');

    const { data } = useFetch({
        fetchOptions: {},
        queryFn: async () => {
            return await balanceAccountEndpointCall({});
        },
    });

    const balanceAccounts = useMemo(() => data?.balanceAccounts, [data?.balanceAccounts]);

    return (
        <div className="adyen-fp-transactions">
            <div className="adyen-fp-transactions__container">
                {balanceAccounts && <TransactionListContainer {...props} balanceAccounts={balanceAccounts} />}
            </div>
        </div>
    );
}

export default TransactionsOverviewComponent;
