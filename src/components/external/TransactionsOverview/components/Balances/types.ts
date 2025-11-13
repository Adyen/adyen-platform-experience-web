import { IBalance, IBalanceAccountBase } from '../../../../../types';

export type IBalanceWithKey = IBalance & {
    balanceElemId: string;
    key: string;
};

export type BalancesProps = {
    balanceAccount?: IBalanceAccountBase;
    balances: Readonly<IBalance>[];
    balancesEmpty: boolean;
    loadingBalances: boolean;
};
