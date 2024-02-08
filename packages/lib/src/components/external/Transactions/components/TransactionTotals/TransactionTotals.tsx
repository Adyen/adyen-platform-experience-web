import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { OperationParameters } from '@src/types/models/openapi/endpoints';

const TransactionTotals = ({
    balanceAccountId,
    createdSince,
    createdUntil,
    categories,
    statuses,
}: OperationParameters<'getTransactionTotals'>['path'] & OperationParameters<'getTransactionTotals'>['query']) => {
    const getTransactionTotals = useSetupEndpoint('getTransactionTotals');

    const fetchCallback = useCallback(async () => {
        return getTransactionTotals(EMPTY_OBJECT, {
            path: { balanceAccountId },
            query: {
                createdSince,
                createdUntil,
                categories,
                statuses,
            },
        });
    }, [getTransactionTotals]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId }), [balanceAccountId]),
        queryFn: fetchCallback,
    });

    return <div></div>;
};

export default TransactionTotals;
