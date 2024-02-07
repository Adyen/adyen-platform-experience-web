import useCoreContext from '@src/core/Context/useCoreContext';
import './TransactionDetails.scss';
import { TransactionDetailsComponentProps } from '../types';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import Alert from '@src/components/internal/Alert';
import Spinner from '@src/components/internal/Spinner';
import { TransactionData } from '@src/components/external/TransactionDetails/components/TransactionData';
import { ExternalUIComponentProps } from '../../../types';
import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';

export default function TransactionDetails({ transaction, transactionId, title }: ExternalUIComponentProps<TransactionDetailsComponentProps>) {
    const { i18n } = useCoreContext();

    const getTransactionDetail = useSetupEndpoint('getTransaction');

    const fetchCallback = useCallback(async () => {
        return getTransactionDetail(EMPTY_OBJECT, {
            path: { transactionId },
        });
    }, [getTransactionDetail, transactionId]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: useMemo(() => ({ enabled: !!transactionId }), [transactionId]),
        queryFn: fetchCallback,
    });

    const transactionData = transaction ?? data;
    return (
        <div className="adyen-fp-transaction">
            {title && <div className="adyen-fp-title">{i18n.get(title)}</div>}

            {isFetching && <Spinner />}

            {error && <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadTransaction')}</Alert>}

            {transactionData && <TransactionData transaction={transactionData} />}
        </div>
    );
}
