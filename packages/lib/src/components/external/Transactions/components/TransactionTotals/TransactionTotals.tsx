import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { OperationParameters } from '@src/types/models/openapi/endpoints';
import { MakeFieldValueUndefined } from '@src/utils/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import './TransactionTotals.scss';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import AmountSkeleton from '@src/components/external/Transactions/components/TransactionTotals/AmountSkeleton';

type TransactionTotalsProps = Required<OperationParameters<'getTransactionTotals'>['path'] & OperationParameters<'getTransactionTotals'>['query']>;

const TransactionTotals = ({
    balanceAccountId,
    createdSince,
    createdUntil,
    categories,
    statuses,
}: MakeFieldValueUndefined<TransactionTotalsProps, 'balanceAccountId'>) => {
    const { i18n } = useCoreContext();

    const getTransactionTotals = useSetupEndpoint('getTransactionTotals');

    const fetchCallback = useCallback(async () => {
        return getTransactionTotals(EMPTY_OBJECT, {
            path: { balanceAccountId: balanceAccountId! },
            query: {
                createdSince,
                createdUntil,
                categories,
                statuses,
            },
        });
    }, [balanceAccountId, categories, createdSince, createdUntil, getTransactionTotals, statuses]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId }), [balanceAccountId]),
        queryFn: fetchCallback,
    });

    const isLoading = !balanceAccountId || (balanceAccountId && !data && !error) || isFetching;

    const totals = data?.totals?.[0];

    const showSkeleton = isLoading || data?.totals?.length === 0;

    // TODO - Refactor to avoid code repetition (this is working as a placeholder component)
    return (
        <div className="adyen-fp-transactions-total">
            <div className="adyen-fp-transactions-total__amount">
                <Typography variant={TypographyVariant.CAPTION}>{i18n.get('incoming')}</Typography>

                {showSkeleton ? (
                    <AmountSkeleton isLoading={isLoading || !balanceAccountId} />
                ) : (
                    <>
                        <Typography variant={TypographyVariant.TITLE}>{totals?.incomings ?? ''}</Typography>
                    </>
                )}
            </div>
            <div className="adyen-fp-transactions-total__amount">
                <Typography variant={TypographyVariant.CAPTION}>{i18n.get('expense')}</Typography>

                {showSkeleton ? (
                    <AmountSkeleton isLoading={isLoading || !balanceAccountId} />
                ) : (
                    <>
                        <Typography variant={TypographyVariant.TITLE}>{totals?.expenses ?? ''}</Typography>
                    </>
                )}
            </div>
            {totals?.currency ? <span>{totals?.currency}</span> : <span>&nbsp;</span>}
        </div>
    );
};

export default TransactionTotals;
