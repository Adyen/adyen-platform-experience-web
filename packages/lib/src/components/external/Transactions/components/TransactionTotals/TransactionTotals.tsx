import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { OperationParameters } from '@src/types/models/openapi/endpoints';
import { MakeFieldValueUndefined } from '@src/utils/types';
import ExpandableCard from '@src/components/internal/ExpandableCard/ExpandableCard';
import { BASE_CLASS } from '@src/components/external/Transactions/components/TransactionTotals/constants';
import { memo } from 'preact/compat';
import { TransactionTotalItem } from '@src/components/external/Transactions/components/TransactionTotalItem/TransactionTotalItem';
import { BaseList } from '@src/components/internal/BaseList/BaseList';
import { useMaxWidthsState } from '@src/components/external/Transactions/hooks/useMaxWidths';
import { ITransaction } from '@src/types';

type TransactionTotalsProps = Required<OperationParameters<'getTransactionTotals'>['query']> & {
    availableCurrencies: ITransaction['amount']['currency'][] | undefined;
};

const TransactionTotals = memo(
    ({
        balanceAccountId,
        createdSince,
        createdUntil,
        categories,
        statuses,
        maxAmount,
        minAmount,
        currencies,
        availableCurrencies,
    }: MakeFieldValueUndefined<TransactionTotalsProps, 'balanceAccountId' | 'minAmount' | 'maxAmount'>) => {
        const getTransactionTotals = useSetupEndpoint('getTransactionTotals');
        const fetchCallback = useCallback(async () => {
            return getTransactionTotals(EMPTY_OBJECT, {
                query: {
                    createdSince,
                    createdUntil,
                    categories,
                    statuses,
                    maxAmount,
                    minAmount,
                    currencies,
                    balanceAccountId: balanceAccountId!,
                },
            });
        }, [balanceAccountId, categories, createdSince, createdUntil, currencies, getTransactionTotals, maxAmount, minAmount, statuses]);

        const { data, error, isFetching } = useFetch({
            fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId }), [balanceAccountId]),
            queryFn: fetchCallback,
        });
        const isLoading = !balanceAccountId || isFetching;

        const totals = data?.totals;
        const [firstTotal, ...restOfTotals] = totals ?? [];

        const [maxWidths, setMaxWidths] = useMaxWidthsState();

        return (
            <div className={BASE_CLASS}>
                <ExpandableCard
                    renderHeader={
                        <TransactionTotalItem
                            total={firstTotal}
                            widths={maxWidths}
                            isHeader
                            isSkeleton={isLoading}
                            isLoading={isLoading}
                            onWidthsSet={setMaxWidths}
                        />
                    }
                >
                    {restOfTotals.length && (
                        <BaseList>
                            {restOfTotals.map(total => (
                                <li key={total.currency}>
                                    <TransactionTotalItem total={total} widths={maxWidths} onWidthsSet={setMaxWidths} />
                                </li>
                            ))}
                        </BaseList>
                    )}
                </ExpandableCard>
            </div>
        );
    }
);

export default TransactionTotals;
