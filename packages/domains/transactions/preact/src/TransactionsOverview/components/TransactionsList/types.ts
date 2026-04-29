import { IBalanceAccountBase } from '../../../../../../../../src/types';
import { ExternalUIComponentProps, TransactionsOverviewComponentProps } from '../../../../../../../../src/components/types';
import useTransactionsList from '../../hooks/useTransactionsList';
import useCurrenciesLookup from '../../hooks/useCurrenciesLookup';

type PropsFromTransactionComponent = Pick<
    ExternalUIComponentProps<TransactionsOverviewComponentProps>,
    'dataCustomization' | 'onContactSupport' | 'onRecordSelection' | 'showDetails'
>;

export interface TransactionsListProps extends PropsFromTransactionComponent {
    balanceAccount?: IBalanceAccountBase;
    loadingBalanceAccounts: boolean;
    currenciesLookupResult: ReturnType<typeof useCurrenciesLookup>;
    transactionsListResult: ReturnType<typeof useTransactionsList>;
}
