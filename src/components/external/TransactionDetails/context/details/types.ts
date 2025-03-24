import type { ILineItem } from '../../../../../types';
import type { TransactionDataProps, TransactionDetailData } from '../../types';
import type { TransactionDataContext, TransactionDataContextProviderProps } from '../types';
import type { TransactionNavigator } from '../../hooks/useTransaction/transactionNavigator/types';

type _ITransactionDetailsContextBase = Pick<
    TransactionDataContext<TransactionDetailsProviderProps>,
    'primaryAction' | 'secondaryAction' | 'transaction'
>;

export interface ITransactionDetailsContext extends _ITransactionDetailsContextBase {
    availableItems: readonly ILineItem[];
    // TODO - Unify this parameter with dataCustomization
    extraFields: Record<string, any> | undefined;
    dataCustomization?: TransactionDataProps['dataCustomization'];
}

export interface TransactionDetailsProviderProps extends TransactionDataContextProviderProps {
    transaction: TransactionDetailData;
    // TODO - Unify this parameter with dataCustomization
    extraFields: Record<string, any> | undefined;
    transactionNavigator: TransactionNavigator;
    dataCustomization?: TransactionDataProps['dataCustomization'];
}
