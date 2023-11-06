import type { BalanceAccount } from '../../../types/models/api/balance-account';
import { TranslationKey } from '@src/core/Localization/types';

export interface BalanceAccountComponentProps {
    balanceAccount?: BalanceAccount;
    balanceAccountId: string;
    onChange?: (newState: Record<any, any>) => void;
    title?: TranslationKey;
}
