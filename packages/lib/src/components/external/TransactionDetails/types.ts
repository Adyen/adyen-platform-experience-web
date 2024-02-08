import { ITransaction } from '../../../types/models/transactions';
import { TranslationKey } from '@src/core/Localization/types';

export interface TransactionDetailsComponentProps {
    transaction?: ITransaction;
    transactionId: string;
    title?: TranslationKey;
}
