import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { memo } from 'preact/compat';
import { BASE_CLASS } from './constants';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { useMaxWidthsState } from '../../hooks/useMaxWidths';
import { BalancesProps, IBalanceWithKey } from './types';

export const Balances = memo(({ balanceAccountId, defaultCurrencyCode, onCurrenciesChange, fullWidth }: BalancesProps) => {
    const { getBalances: getAccountsBalance } = useConfigContext().endpoints;

    const fetchCallback = useCallback(async () => {
        return getAccountsBalance?.(EMPTY_OBJECT, {
            path: { balanceAccountId: balanceAccountId! },
        });
    }, [balanceAccountId, getAccountsBalance]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId && !!getAccountsBalance }), [balanceAccountId, getAccountsBalance]),
        queryFn: fetchCallback,
    });

    const isLoading = !balanceAccountId || isFetching;
    const isEmpty = !!error || !data?.data.length;

    const balances = useMemo(() => {
        return (
            data?.data &&
            [...data.data].sort(({ currency: firstCurrency }, { currency: secondCurrency }) => {
                if (defaultCurrencyCode) {
                    if (firstCurrency === defaultCurrencyCode) return -1;
                    if (secondCurrency === defaultCurrencyCode) return 1;
                }
                return firstCurrency.localeCompare(secondCurrency);
            })
        );
    }, [data?.data, defaultCurrencyCode]);

    const [firstBalance, ...restOfBalances] = useMemo(() => {
        return (
            balances?.map((t: Partial<IBalanceWithKey>) => {
                t['key'] = `${t.currency}-${Math.random()}`;
                return t as IBalanceWithKey;
            }) ?? []
        );
    }, [balances]);

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
                            <li key={balance.key}>
                                <BalanceItem balance={balance} widths={maxWidths} onWidthsSet={setMaxWidths} />
                            </li>
                        ))}
                    </BaseList>
                )}
            </ExpandableCard>
        </div>
    );
});
