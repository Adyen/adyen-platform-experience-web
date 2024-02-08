import { TransactionsComponentProps } from '../types';
import { ExternalUIComponentProps } from '../../../types';
import './TransactionList.scss';
import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { TransactionsOverview } from '@src/components/external/Transactions/components/TransactionsOverview';
import { useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';

function TransactionsOverviewComponent(props: ExternalUIComponentProps<TransactionsComponentProps>) {
    // Balance Accounts
    const balanceAccountEndpointCall = useSetupEndpoint('getBalanceAccounts');

    const { data } = useFetch({
        fetchOptions: EMPTY_OBJECT,
        queryFn: async () => {
            return await balanceAccountEndpointCall(EMPTY_OBJECT);
        },
    });

    const balanceAccounts = useMemo(() => data?.balanceAccounts, [data?.balanceAccounts]);

    return (
        <div className="adyen-fp-transactions">
            <div className="adyen-fp-transactions__container">
                {balanceAccounts && <TransactionsOverview {...props} balanceAccounts={balanceAccounts} />}
            </div>
        </div>
    );
}

export default TransactionsOverviewComponent;
