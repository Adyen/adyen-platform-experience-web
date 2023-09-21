import { ITransaction } from '../../../types/models/api/transactions';
import { UIElementProps } from '../../types';
import { TranslationKey } from '@src/core/Localization/types';

export interface TransactionDetailsComponentProps extends UIElementProps {
    transaction?: ITransaction;
    transactionId: string;
    title?: TranslationKey;
}
