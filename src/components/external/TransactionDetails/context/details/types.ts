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
    extraFields: Record<string, any> | undefined;
}

export interface TransactionDetailsProviderProps extends TransactionDataContextProviderProps {
    transaction: TransactionDetailData;
    extraFields: Record<string, any> | undefined;
    transactionNavigator: TransactionNavigator;
}
