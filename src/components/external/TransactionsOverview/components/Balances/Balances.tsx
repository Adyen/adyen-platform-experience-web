import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT, uniqueId } from '../../../../../utils';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { memo } from 'preact/compat';
import { BASE_CLASS } from './constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { useMaxWidthsState } from '../../hooks/useMaxWidths';
import { BalancesProps, IBalanceWithKey } from './types';

export const Balances = memo(({ balanceAccountId, defaultCurrencyCode, onCurrenciesChange, fullWidth }: BalancesProps) => {
    const { i18n } = useCoreContext();
    const { getBalances: getAccountsBalance } = useConfigContext().endpoints;

    const balancesAriaLabel = useMemo(() => i18n.get('transactions.overview.balances.labels.default'), [i18n]);
    const localizedPlainCurrencyText = useMemo(() => i18n.get('transactions.overview.balances.currency.label'), [i18n]);

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
                t['balanceElemId'] = uniqueId('elem');
                return t as IBalanceWithKey;
            }) ?? []
        );
    }, [balances]);

    const [maxWidths, setMaxWidths] = useMaxWidthsState();

    const renderFirstBalance = useMemo(
        () => (
            <div
                role="listitem"
                aria-label={firstBalance ? `${localizedPlainCurrencyText}: ${firstBalance.currency}` : undefined}
                aria-describedby={firstBalance ? `${firstBalance.balanceElemId}` : undefined}
            >
                <BalanceItem
                    isEmpty={isEmpty}
                    balance={firstBalance}
                    widths={maxWidths}
                    isHeader
                    isSkeleton={isLoading}
                    isLoading={isLoading}
                    onWidthsSet={setMaxWidths}
                    balanceElemId={firstBalance?.balanceElemId}
                />
            </div>
        ),
        [isEmpty, firstBalance, maxWidths, isLoading, setMaxWidths, localizedPlainCurrencyText]
    );

    const renderRestOfBalances = useMemo(() => {
        return !isLoading && restOfBalances.length ? (
            <>
                {restOfBalances.map(balance => (
                    <div
                        role="listitem"
                        key={balance.key}
                        aria-label={`${localizedPlainCurrencyText}: ${balance.currency}`}
                        aria-describedby={`${balance.balanceElemId}`}
                    >
                        <BalanceItem balance={balance} widths={maxWidths} onWidthsSet={setMaxWidths} balanceElemId={balance.balanceElemId} />
                    </div>
                ))}
            </>
        ) : undefined;
    }, [isLoading, restOfBalances, maxWidths, setMaxWidths, localizedPlainCurrencyText]);

    useEffect(() => {
        const currencies = new Set(balances?.map(({ currency }) => currency) || []);
        onCurrenciesChange(Array.from(currencies), isFetching);
    }, [balances, isFetching, onCurrenciesChange]);

    return (
        <div className={BASE_CLASS}>
            <ExpandableCard
                aria-label={balancesAriaLabel}
                renderContent={({ collapsibleContent }) => (
                    <div role="list" aria-label={i18n.get('transactions.overview.balances.lists.default')}>
                        {renderFirstBalance}
                        {collapsibleContent}
                    </div>
                )}
                filled
                fullWidth={fullWidth}
            >
                {renderRestOfBalances}
            </ExpandableCard>
        </div>
    );
});
