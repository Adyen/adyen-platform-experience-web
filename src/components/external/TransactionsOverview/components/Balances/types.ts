import { IBalance, IBalanceAccountBase, ITransaction } from '../../../../../types';

export type IBalanceWithKey = IBalance & {
    balanceElemId: string;
    key: string;
};

export type BalancesProps = {
    balanceAccount?: IBalanceAccountBase;
    onCurrenciesChange: (currencies: ITransaction['amount']['currency'][] | undefined, isFetching: boolean) => any;
    defaultCurrencyCode: ITransaction['amount']['currency'] | undefined;
    fullWidth?: boolean;
};
