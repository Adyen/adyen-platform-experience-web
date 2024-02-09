import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { OperationParameters } from '@src/types/models/openapi/endpoints';
import { MakeFieldValueUndefined } from '@src/utils/types';
import Spinner from '@src/components/internal/Spinner';
import useCoreContext from '@src/core/Context/useCoreContext';
import './TransactionTotals.scss';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';

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

    const isLoading = useMemo(() => {
        return !balanceAccountId || isFetching;
    }, [balanceAccountId, isFetching]);

    const totals = data?.totals?.[0];

    return isLoading ? (
        <Spinner />
    ) : (
        <div className="adyen-fp-transactions-total">
            <div className="adyen-fp-transactions-total__amount">
                <Typography variant={TypographyVariant.CAPTION}>{i18n.get('incoming')}</Typography>
                <Typography variant={TypographyVariant.TITLE}>{totals?.incomings ?? ''}</Typography>
            </div>
            <div className="adyen-fp-transactions-total__amount">
                <Typography variant={TypographyVariant.CAPTION}>{i18n.get('expense')}</Typography>
                <Typography variant={TypographyVariant.TITLE}>{totals?.expenses ?? ''}</Typography>
            </div>
            <span>{totals?.currency}</span>
        </div>
    );
};

export default TransactionTotals;
