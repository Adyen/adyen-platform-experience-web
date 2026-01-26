import { IBalanceAccountBase } from '../../../../../types';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../../types';
import useTransactionsList from '../../hooks/useTransactionsList';
import useCurrenciesLookup from '../../hooks/useCurrenciesLookup';

type PropsFromTransactionComponent = Pick<
    ExternalUIComponentProps<TransactionOverviewComponentProps>,
    'dataCustomization' | 'onContactSupport' | 'onRecordSelection' | 'showDetails'
>;

export interface TransactionsListProps extends PropsFromTransactionComponent {
    balanceAccount?: IBalanceAccountBase;
    loadingBalanceAccounts: boolean;
    currenciesLookupResult: ReturnType<typeof useCurrenciesLookup>;
    transactionsListResult: ReturnType<typeof useTransactionsList>;
}
