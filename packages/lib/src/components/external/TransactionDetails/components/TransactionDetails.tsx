import { TransactionData } from './TransactionData';
import { ErrorMessageDisplay } from '../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import useCoreContext from '../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../core/Errors/AdyenPlatformExperienceError';
import { useFetch } from '../../../../hooks/useFetch/useFetch';
import { useSetupEndpoint } from '../../../../hooks/useSetupEndpoint/useSetupEndpoint';
import { EMPTY_OBJECT } from '../../../../utils/common';
import { useCallback, useMemo } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../types';
import { TransactionDetailsComponentProps, TransactionDetailsWithoutIdProps } from '../types';
import './TransactionDetails.scss';

const isTransactionWithoutId = (props: TransactionDetailsComponentProps): props is TransactionDetailsWithoutIdProps => 'transaction' in props;

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

    const errorProps = useMemo(() => {
        if (error) {
            return getErrorMessage(error as AdyenPlatformExperienceError, 'weCouldNotLoadYourTransactions', props.onContactSupport);
        }
    }, [error, props.onContactSupport]);

    const transactionData = transaction ?? data;
    return (
        <div className="adyen-pe-transaction">
            {props.title && <div className="adyen-pe-title">{i18n.get(props.title)}</div>}

            {error && errorProps && (
                <div className="adyen-pe-transaction--error-container">
                    <ErrorMessageDisplay centered withImage {...errorProps} />
                </div>
            )}

            <TransactionData transaction={transactionData} isFetching={isFetching} />
        </div>
    );
}
