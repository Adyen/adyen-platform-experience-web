import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { OperationParameters } from '@src/types/models/openapi/endpoints';
import { MakeFieldValueUndefined } from '@src/utils/types';
import { memo } from 'preact/compat';
import { BASE_CLASS } from '@src/components/external/Transactions/components/Balances/constants';
import ExpandableCard from '@src/components/internal/ExpandableCard/ExpandableCard';
import { BaseList } from '@src/components/internal/BaseList/BaseList';
import { BalanceItem } from '@src/components/external/Transactions/components/BalanceItem/BalanceItem';
import { useMaxWidthsState } from '@src/components/external/Transactions/hooks/useMaxWidths';

type TransactionTotalsProps = Required<OperationParameters<'getBalances'>['path']>;

export const Balances = memo(
    ({
        balanceAccountId,
        updateBalanceAccountCurrencies,
    }: MakeFieldValueUndefined<TransactionTotalsProps, 'balanceAccountId'> & {
        updateBalanceAccountCurrencies: (currencies?: readonly string[]) => any;
    }) => {
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

        useEffect(() => {
            if (!error) {
                updateBalanceAccountCurrencies(Object.freeze(data?.balances.map(({ currency }) => currency).sort()));
            }
        }, [data, error, updateBalanceAccountCurrencies]);

        const isLoading = !balanceAccountId || isFetching;
        const isSkeletonVisible = isLoading || !!error || !data?.balances.length;

        const balances = data?.balances;
        const [firstBalance, ...restOfBalances] = balances ?? [];

        const [maxWidths, setMaxWidths] = useMaxWidthsState();

        return (
            <div className={BASE_CLASS}>
                <ExpandableCard
                    renderHeader={
                        <BalanceItem
                            balance={firstBalance}
                            widths={maxWidths}
                            isHeader
                            isSkeleton={isSkeletonVisible}
                            isLoading={isLoading}
                            onWidthsSet={setMaxWidths}
                        />
                    }
                    filled
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
    }
);
