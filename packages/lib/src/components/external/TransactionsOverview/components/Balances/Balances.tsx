import { useSetupEndpoint } from '../../../../../hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils/common';
import { useFetch } from '../../../../../hooks/useFetch/useFetch';
import { OperationParameters } from '../../../../../types/api/endpoints';
import { MakeFieldValueUndefined } from '../../../../../utils/types';
import { memo } from 'preact/compat';
import { BASE_CLASS } from './constants';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { useMaxWidthsState } from '../../hooks/useMaxWidths';
import { ITransaction } from '../../../../../types';

type TransactionTotalsProps = Required<OperationParameters<'getBalances'>['path']>;

type BalancesProps = MakeFieldValueUndefined<TransactionTotalsProps, 'balanceAccountId'> & {
    onCurrenciesChange: (currencies: ITransaction['amount']['currency'][] | undefined, isFetching: boolean) => any;
    fullWidth?: boolean;
};

export const Balances = memo(({ balanceAccountId, onCurrenciesChange, fullWidth }: BalancesProps) => {
    const getAccountsBalance = useSetupEndpoint('getBalances');

    const fetchCallback = useCallback(async () => {
        return getAccountsBalance(EMPTY_OBJECT, {
            path: { balanceAccountId: balanceAccountId! },
        });
    }, [balanceAccountId, getAccountsBalance]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId }), [balanceAccountId]),
        queryFn: fetchCallback,
    });

    const isLoading = !balanceAccountId || isFetching;
    const isEmpty = !!error || !data?.balances.length;

    const balances = data?.balances.sort((a, b) => a.currency.localeCompare(b.currency));
    const [firstBalance, ...restOfBalances] = balances ?? [];

    const [maxWidths, setMaxWidths] = useMaxWidthsState();

    useEffect(() => {
        const currencies = new Set(balances?.map(({ currency }) => currency) || []);
        onCurrenciesChange(Array.from(currencies), isFetching);
    }, [balances, isFetching, onCurrenciesChange]);

    return (
        <div className={BASE_CLASS}>
            <ExpandableCard
                renderHeader={
                    <BalanceItem
                        isEmpty={isEmpty}
                        balance={firstBalance}
                        widths={maxWidths}
                        isHeader
                        isSkeleton={isLoading}
                        isLoading={isLoading}
                        onWidthsSet={setMaxWidths}
                    />
                }
                filled
                fullWidth={fullWidth}
            >
                {restOfBalances.length && (
                    <BaseList>
                        {restOfBalances.map(balance => (
                            <li key={balance.currency}>
                                <BalanceItem balance={balance} widths={maxWidths} onWidthsSet={setMaxWidths} />
                            </li>
                        ))}
                    </BaseList>
                )}
            </ExpandableCard>
        </div>
    );
});
