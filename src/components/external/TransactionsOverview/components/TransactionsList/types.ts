import { IBalanceAccountBase } from '../../../../../types';
import { ExternalUIComponentProps, TransactionOverviewComponentProps } from '../../../../types';
import useTransactionsList from '../../hooks/useTransactionsList';

type PropsFromTransactionComponent = Pick<
    ExternalUIComponentProps<TransactionOverviewComponentProps>,
    'dataCustomization' | 'onContactSupport' | 'onRecordSelection' | 'showDetails'
>;

type PropsFromUseTransactionsList = Omit<
    UseTransactionsListPropsResult,
    'error' | 'fetching' | 'fields' | 'hasCustomColumn' | 'records' | 'updateLimit'
>;

type UseTransactionsListPropsResult = ReturnType<typeof useTransactionsList>;

export interface TransactionsListProps extends PropsFromTransactionComponent, PropsFromUseTransactionsList {
    availableCurrencies: readonly string[];
    balanceAccount?: IBalanceAccountBase;
    hasMultipleCurrencies: boolean;
    loadingBalanceAccounts: boolean;
    loadingTransactions: UseTransactionsListPropsResult['fetching'];
    onLimitSelection: UseTransactionsListPropsResult['updateLimit'];
    transactionsError: UseTransactionsListPropsResult['error'];
    transactionsFields: UseTransactionsListPropsResult['fields'];
    transactions: UseTransactionsListPropsResult['records'];
}
