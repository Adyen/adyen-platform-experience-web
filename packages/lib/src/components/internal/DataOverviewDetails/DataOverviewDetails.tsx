import './DataOverviewDetails.scss';
import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { useFetch } from '../../../hooks/useFetch/useFetch';
import { useSetupEndpoint } from '../../../hooks/useSetupEndpoint/useSetupEndpoint';
import { IPayoutDetails } from '../../../types';
import { EndpointName } from '../../../types/api/endpoints';
import { EMPTY_OBJECT } from '../../../utils/common';
import { PayoutData } from '../../external/PayoutDetails/components/PayoutData';
import { TransactionData } from '../../external/TransactionDetails/components/TransactionData';
import { ExternalUIComponentProps } from '../../types';
import { getErrorMessage } from '../../utils/getDataOverviewResourceErrorCode';
import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { DetailsComponentProps, DetailsWithoutIdProps, TransactionDetailData } from './types';

const endpointsByType = {
    transaction: {
        url: 'getTransaction' as EndpointName,
        path: 'transactionId',
    },
    payout: {
        url: 'getPayout' as EndpointName,
        path: 'payoutId',
    },
};
const isTransactionWithoutId = (props: DetailsComponentProps): props is DetailsWithoutIdProps => 'data' in props;
const getTransactionType = (type: string, dataId: string) => (type === 'transaction' && dataId ? { transactionId: dataId } : { payoutId: dataId });

const checkType = (pathProp: { transactionId: string } | { payoutId: string }): pathProp is { transactionId: string } => 'transactionId' in pathProp;

export default function DataOverviewDetails(props: ExternalUIComponentProps<DetailsComponentProps>) {
    const transaction = useMemo(() => (isTransactionWithoutId(props) ? props.data : null), [props]);
    const dataId = useMemo(() => (!isTransactionWithoutId(props) ? props.id : null), [props]);

    const { i18n } = useCoreContext();

    const url = endpointsByType[props.type].url as 'getPayout' | 'getTransaction';

    const getDetail = useSetupEndpoint(url);

    const fetchCallback = useCallback(async () => {
        if (dataId) {
            // const pathProp = props.type === 'transaction' ? getTransactionType(props.type, dataId) as {payoutId: string} : getTransactionType(props.type, dataId) as {payoutId: string}
            const pathProp =
                props.type === 'transaction'
                    ? {
                          path: { transactionId: dataId },
                      }
                    : {
                          path: { payoutId: dataId },
                      };
            return getDetail(EMPTY_OBJECT, { ...pathProp });
        }
    }, [getDetail, dataId, props.type]);

    const { data, error, isFetching } = useFetch({
        fetchOptions: useMemo(() => ({ enabled: !!dataId }), [dataId]),
        queryFn: fetchCallback,
    });

    const errorProps = useMemo(() => {
        if (error) {
            return getErrorMessage(error as AdyenPlatformExperienceError, 'weCouldNotLoadYourTransactions', props.onContactSupport);
        }
    }, [error, props.onContactSupport]);

    const transactionData = transaction ?? data;
    return (
        <div className="adyen-pe-overview-details">
            {props.title && <div className="adyen-pe-overview-details--title">{i18n.get(props.title)}</div>}

            {error && errorProps && (
                <div className="adyen-pe-overview-details--error-container">
                    <ErrorMessageDisplay centered withImage {...errorProps} />
                </div>
            )}

            {props.type === 'transaction' && transactionData && (
                <TransactionData transaction={transactionData as TransactionDetailData} isFetching={isFetching} />
            )}
            {props.type === 'payout' && transactionData && <PayoutData payout={transactionData as IPayoutDetails} isFetching={isFetching} />}
        </div>
    );
}
