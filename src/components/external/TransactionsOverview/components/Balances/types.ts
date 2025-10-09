import { IBalance, ITransaction } from '../../../../../types';
import { OperationParameters } from '../../../../../types/api/endpoints';
import { WithPartialField } from '../../../../../utils/types';

export type IBalanceWithKey = IBalance & {
    balanceElemId: string;
    key: string;
};

type TransactionTotalsProps = Required<OperationParameters<'getBalances'>['path']>;

export type BalancesProps = WithPartialField<TransactionTotalsProps, 'balanceAccountId'> & {
    onCurrenciesChange: (currencies: ITransaction['amount']['currency'][] | undefined, isFetching: boolean) => any;
    defaultCurrencyCode: ITransaction['amount']['currency'] | undefined;
    fullWidth?: boolean;
};
