import type { UIElementProps } from '../../types';
import type { BalanceAccount } from '../../../types/models/api/balance-account';

export interface BalanceAccountComponentProps extends UIElementProps {
    balanceAccount?: BalanceAccount;
    balanceAccountId: string;
    onChange?: (newState: Record<any, any>) => void;
}
