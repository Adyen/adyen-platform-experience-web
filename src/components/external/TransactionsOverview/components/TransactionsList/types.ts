import { IBalanceAccountBase } from '../../../../../types';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../../types';
import useAccountBalances from '../../../../../hooks/useAccountBalances';
import useTransactionsList from '../../hooks/useTransactionsList';

type PropsFromTransactionComponent = Pick<
    ExternalUIComponentProps<TransactionOverviewComponentProps>,
    'dataCustomization' | 'onContactSupport' | 'onRecordSelection' | 'showDetails'
>;

export interface TransactionsListProps extends PropsFromTransactionComponent {
    balanceAccount?: IBalanceAccountBase;
    loadingBalanceAccounts: boolean;
    accountBalancesResult: ReturnType<typeof useAccountBalances>;
    transactionsListResult: ReturnType<typeof useTransactionsList>;
}
