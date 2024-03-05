import { TransactionData } from '@src/components/external/TransactionDetails/components/TransactionData';
import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '@src/components/utils/errorCodes';
import useCoreContext from '@src/core/Context/useCoreContext';
import AdyenFPError from '@src/core/Errors/AdyenFPError';
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

    const { i18n, onContactSupport } = useCoreContext();

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

    const errorProps = useMemo(() => getErrorMessage(error as AdyenFPError, onContactSupport), [error, onContactSupport]);

    const transactionData = transaction ?? data;
    return (
        <div className="adyen-fp-transaction">
            {props.title && <div className="adyen-fp-title">{i18n.get(props.title)}</div>}

            {error && (
                <div className="adyen-fp-transaction--error-container">
                    <ErrorMessageDisplay centered withImage {...errorProps} />
                </div>
            )}

            <TransactionData transaction={transactionData} isFetching={isFetching} />
        </div>
    );
}
