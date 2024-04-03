import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { OperationParameters } from '@src/types/models/openapi/endpoints';
import { MakeFieldValueUndefined } from '@src/utils/types';
import ExpandableCard from '@src/components/internal/ExpandableCard/ExpandableCard';
import { BASE_CLASS } from '@src/components/external/TransactionsOverview/components/TransactionTotals/constants';
import { memo } from 'preact/compat';
import { TransactionTotalItem } from '@src/components/external/TransactionsOverview/components/TransactionTotalItem/TransactionTotalItem';
import { BaseList } from '@src/components/internal/BaseList/BaseList';
import { useMaxWidthsState } from '@src/components/external/TransactionsOverview/hooks/useMaxWidths';
import { ITransaction } from '@src/types';

type TransactionTotalsProps = Required<OperationParameters<'getTransactionTotals'>['query']> & {
    isAvailableCurrenciesFetching: boolean;
    availableCurrencies: ITransaction['amount']['currency'][] | undefined;
};

const TransactionTotals = memo(
    ({
        availableCurrencies,
        isAvailableCurrenciesFetching,
        balanceAccountId,
        createdSince,
        createdUntil,
        categories,
        statuses,
        maxAmount,
        minAmount,
        currencies,
    }: MakeFieldValueUndefined<TransactionTotalsProps, 'balanceAccountId' | 'minAmount' | 'maxAmount'>) => {
        const [isHovered, setIsHovered] = useState(false);

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

        const { data, isFetching } = useFetch({
            fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId }), [balanceAccountId]),
            queryFn: fetchCallback,
        });
        const isLoading = !balanceAccountId || isFetching || isAvailableCurrenciesFetching;

        const getTotals = useCallback(() => {
            if (!availableCurrencies || !data) {
                return data?.totals;
            }

            const partialTotals = availableCurrencies.map(currency => {
                const totalOfCurrency = data.totals.find(total => total.currency === currency);
                return totalOfCurrency || { currency, incomings: 0, expenses: 0 };
            });

            return partialTotals.concat(data.totals.filter(total => !partialTotals.includes(total)));
        }, [availableCurrencies, data]);

        const [firstTotal, ...restOfTotals] = getTotals() ?? [];

        const [maxWidths, setMaxWidths] = useMaxWidthsState();

        return (
            <div className={BASE_CLASS}>
                <ExpandableCard
                    renderHeader={
                        <TransactionTotalItem
                            isHovered={isHovered}
                            total={firstTotal}
                            widths={maxWidths}
                            isHeader
                            isSkeleton={isLoading}
                            isLoading={isLoading}
                            onWidthsSet={setMaxWidths}
                        />
                    }
                    onMouseEnter={() => setIsHovered(true)}
                    onFocus={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onBlur={() => setIsHovered(false)}
                >
                    {!isLoading && restOfTotals.length && (
                        <BaseList>
                            {restOfTotals.map(total => (
                                <li key={total.currency}>
                                    <TransactionTotalItem isHovered={isHovered} total={total} widths={maxWidths} onWidthsSet={setMaxWidths} />
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
