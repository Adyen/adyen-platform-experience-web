import { IAmount, IBalance, IBalanceAccountBase } from '../../../../../types';

export type IBalanceWithKey = IBalance & {
    balanceElemId: string;
    key: string;
};

export interface BalancesProps {
    balanceAccount?: IBalanceAccountBase;
    onCurrenciesChange: (currencies: IAmount['currency'][] | undefined, isFetching: boolean) => any;
    fullWidth?: boolean;
}
