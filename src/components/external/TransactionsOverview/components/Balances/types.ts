import { IBalance, IBalanceAccountBase } from '../../../../../types';

export type IBalanceWithKey = IBalance & {
    balanceElemId: string;
    key: string;
};

export type BalancesProps = {
    balanceAccount?: Readonly<IBalanceAccountBase>;
    balances: readonly Readonly<IBalance>[];
    balancesEmpty: boolean;
    loadingBalances: boolean;
};
