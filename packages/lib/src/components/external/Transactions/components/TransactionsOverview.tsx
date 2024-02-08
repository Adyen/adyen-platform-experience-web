import useCoreContext from '@src/core/Context/useCoreContext';
import { TransactionsComponentProps } from '../types';
import { ExternalUIComponentProps } from '../../../types';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import './TransactionList.scss';
import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { TransactionListContainer } from '@src/components/external/Transactions/components/TransactionListContainer';
import { useMemo } from 'preact/hooks';

function TransactionsOverviewComponent(props: ExternalUIComponentProps<TransactionsComponentProps>) {
    const { i18n } = useCoreContext();

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
                {props.withTitle && (
                    <Typography large variant={TypographyVariant.TITLE}>
                        {i18n.get('transactionsOverview')}
                    </Typography>
                )}

                {balanceAccounts && <TransactionListContainer {...props} balanceAccounts={balanceAccounts} />}
            </div>
        </div>
    );
}

export default TransactionsOverviewComponent;
