import type { UIElementProps } from '../types';
import type { BalanceAccount } from '../../types/models/api/balance-account';

export * from '../../types/models/api/balance-account';
export interface BalanceAccountComponentProps extends UIElementProps {
    balanceAccount: BalanceAccount;
    onChange?: (newState: Record<any, any>) => void;
}
