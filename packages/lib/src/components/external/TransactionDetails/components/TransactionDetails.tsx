import { TransactionData } from '@src/components/external/TransactionDetails/components/TransactionData';
import Alert from '@src/components/internal/Alert';
import Spinner from '@src/components/internal/Spinner';
import useCoreContext from '@src/core/Context/useCoreContext';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { EMPTY_OBJECT, hasOwnProperty } from '@src/utils/common';
import { useCallback, useMemo } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../types';
import { TransactionDetailsComponentProps, TransactionDetailsWithoutIdProps } from '../types';
import './TransactionDetails.scss';

export const isTransactionWithoutId = (props: TransactionDetailsComponentProps): props is TransactionDetailsWithoutIdProps =>
    hasOwnProperty(props, 'transaction');

export default function TransactionDetails(props: ExternalUIComponentProps<TransactionDetailsComponentProps>) {
    const transaction = useMemo(() => (isTransactionWithoutId(props) ? props.transaction : null), [props]);
    const transactionId = useMemo(() => (!isTransactionWithoutId(props) ? props.transactionId : null), [props]);

    const { i18n } = useCoreContext();

    const getTransactionDetail = useSetupEndpoint('getTransaction');

    const fetchCallback = useCallback(async () => {
        if (transactionId) {
            return getTransactionDetail(EMPTY_OBJECT, {
                path: { transactionId },
            });
        }
    }, [getTransactionDetail, transactionId]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: useMemo(() => ({ enabled: !!transactionId }), [transactionId]),
        queryFn: fetchCallback,
    });

    const transactionData = transaction ?? data;
    return (
        <div className="adyen-fp-transaction">
            {props.title && <div className="adyen-fp-title">{i18n.get(props.title)}</div>}

            {isFetching && <Spinner />}

            {error && <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadTransaction')}</Alert>}

            {transactionData && (
                <>
                    <TransactionData transaction={transactionData} />
                </>
            )}
        </div>
    );
}
