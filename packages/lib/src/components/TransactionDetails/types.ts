import { Transaction } from '../Transactions/types';
import { UIElementProps } from '../types';

export interface TransactionDetailsProps extends UIElementProps {
    transaction: Transaction;
}
