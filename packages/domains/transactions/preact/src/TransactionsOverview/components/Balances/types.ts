import { AriaAttributes } from 'preact/compat';
import { IBalance } from '@integration-components/types';

export type BalancesCardProps = {
    balances: readonly Readonly<IBalance>[];
    hiddenField?: 'available' | 'reserved';
    isLoading: boolean;
    fullWidth?: boolean;
} & Pick<AriaAttributes, 'aria-label'>;

export type IBalanceWithKey = IBalance & {
    availableBalanceElemId?: string;
    reservedBalanceElemId?: string;
    key?: string;
};

export type BalancesProps = {
    balances: readonly Readonly<IBalance>[];
    loadingBalances: boolean;
};
