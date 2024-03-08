import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { OperationParameters } from '@src/types/models/openapi/endpoints';
import { MakeFieldValueUndefined } from '@src/utils/types';
import ExpandableCard from '@src/components/internal/ExpandableCard/ExpandableCard';
import { BASE_CLASS } from '@src/components/external/Transactions/components/TransactionTotals/constants';
import { memo } from 'preact/compat';
import { TotalItem } from '@src/components/external/Transactions/components/TotalItem/TotalItem';
import './TransactionTotals.scss';
import { BaseList } from '@src/components/internal/BaseList/BaseList';

type TransactionTotalsProps = Required<OperationParameters<'getTransactionTotals'>['query']>;

const TransactionTotals = memo(
    ({ balanceAccountId, createdSince, createdUntil, categories, statuses }: MakeFieldValueUndefined<TransactionTotalsProps, 'balanceAccountId'>) => {
        const getTransactionTotals = useSetupEndpoint('getTransactionTotals');

        const fetchCallback = useCallback(async () => {
            return getTransactionTotals(EMPTY_OBJECT, {
                query: {
                    createdSince,
                    createdUntil,
                    categories,
                    statuses,
                    balanceAccountId: balanceAccountId!,
                },
            });
        }, [balanceAccountId, categories, createdSince, createdUntil, getTransactionTotals, statuses]);

        const { data, error, isFetching } = useFetch({
            fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId }), [balanceAccountId]),
            queryFn: fetchCallback,
        });
        const isLoading = !balanceAccountId || isFetching;
        const isSkeletonVisible = isLoading || !!error || !data?.totals.length;

        const totals = data?.totals;
        const [firstTotal, ...restOfTotals] = totals ?? [];

        const [maxWidths, setMaxWidths] = useState<number[]>([]);
        const setMaxWidthConditionally = useCallback((widths: number[]) => {
            setMaxWidths(currentMaxWidths =>
                widths.map((width, index) => {
                    const currentMaxWidth = currentMaxWidths[index];
                    return !currentMaxWidth || width > currentMaxWidth ? width : currentMaxWidth;
                })
            );
        }, []);

        return (
            <div className={BASE_CLASS}>
                <ExpandableCard
                    renderHeader={
                        <TotalItem
                            total={firstTotal}
                            widths={maxWidths}
                            isHeader
                            isSkeleton={isSkeletonVisible}
                            isLoading={isLoading}
                            onWidthsSet={setMaxWidthConditionally}
                        />
                    }
                >
                    {restOfTotals.length && (
                        <BaseList>
                            {restOfTotals.map(total => (
                                <li key={total.currency}>
                                    <TotalItem total={total} widths={maxWidths} onWidthsSet={setMaxWidthConditionally} />
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
