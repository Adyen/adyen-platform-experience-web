import { ITransaction } from '../../types/models/api/transactions';
import { UIElementProps } from '../types';

export * from '../../types/models/api/transactions';
export interface TransactionDetailsProps extends UIElementProps {
    transaction: ITransaction;
}
