import { ITransaction } from '../../../types/models/api/transactions';
import { UIElementProps } from '../../types';

export interface TransactionDetailsComponentProps extends UIElementProps {
    transaction?: ITransaction;
    transactionId: string;
}
