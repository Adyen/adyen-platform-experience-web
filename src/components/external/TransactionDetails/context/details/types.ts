import type { ILineItem } from '../../../../../types';
import type { TransactionDetailData } from '../../types';
import type { TransactionDataContext, TransactionDataContextProviderProps } from '../types';
import type { TransactionNavigator } from '../../hooks/useTransaction/transactionNavigator/types';

type _ITransactionDetailsContextBase = Pick<
    TransactionDataContext<TransactionDetailsProviderProps>,
    'primaryAction' | 'secondaryAction' | 'transaction'
>;

export interface ITransactionDetailsContext extends _ITransactionDetailsContextBase {
    availableItems: readonly ILineItem[];
}

export interface TransactionDetailsProviderProps extends TransactionDataContextProviderProps {
    transaction: TransactionDetailData;
    transactionNavigator: TransactionNavigator;
}
