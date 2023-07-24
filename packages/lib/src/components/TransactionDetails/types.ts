import { ITransaction } from '../../types/models/api/transactions';
import { UIElementProps } from '../types';

export * from '../../types/models/api/transactions';
export interface TransactionDetailsComponentProps extends UIElementProps {
    transaction: ITransaction;
}
