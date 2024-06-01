import './DataOverviewDetails.scss';
import { useMemo } from 'preact/hooks';
import { useAuthContext } from '../../../core/Auth';
import useCoreContext from '../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { useFetch } from '../../../hooks/useFetch/useFetch';
import { IPayoutDetails } from '../../../types';
import { EMPTY_OBJECT } from '../../../utils';
import { PayoutData } from '../../external/PayoutDetails/components/PayoutData';
import { TransactionData } from '../../external/TransactionDetails/components/TransactionData';
import { ExternalUIComponentProps } from '../../types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { DetailsComponentProps, DetailsWithoutIdProps, TransactionDetailData } from './types';

const ENDPOINTS_BY_TYPE = {
    transaction: 'getTransaction',
    payout: 'getPayout',
} as const;

const isDetailsWithoutId = (props: DetailsComponentProps): props is DetailsWithoutIdProps => 'data' in props;

export default function DataOverviewDetails(props: ExternalUIComponentProps<DetailsComponentProps>) {
    const details = useMemo(() => (isDetailsWithoutId(props) ? props.data : null), [props]);
    const dataId = useMemo(() => (!isDetailsWithoutId(props) ? props.id : null), [props]);

    const { i18n } = useCoreContext();
    const getDetail = useAuthContext().endpoints[ENDPOINTS_BY_TYPE[props.type]] as any; // [TODO]: Fix type and remove 'as any'

    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!dataId && !!getDetail },
                queryFn: async () => {
                    const pathParam = props.type === 'transaction' ? 'transactionId' : 'payoutId';

                    const params = {
                        path: { [pathParam]: dataId! },
                    } as Parameters<NonNullable<typeof getDetail>>[1];

                    return getDetail!(EMPTY_OBJECT, params);
                },
            }),
            [dataId, getDetail, props.type]
        )
    );

    const errorProps = useMemo(() => {
        if (error) {
            return getErrorMessage(error as AdyenPlatformExperienceError, 'weCouldNotLoadYourTransactions', props.onContactSupport);
        }
    }, [error, props.onContactSupport]);

    const detailsData = details ?? data;

    return (
        <div className="adyen-pe-overview-details">
            {props.title && <div className="adyen-pe-overview-details--title">{i18n.get(props.title)}</div>}

            {error && errorProps && (
                <div className="adyen-pe-overview-details--error-container">
                    <ErrorMessageDisplay centered withImage {...errorProps} />
                </div>
            )}

            {props.type === 'transaction' && detailsData && (
                <TransactionData transaction={detailsData as TransactionDetailData} isFetching={isFetching} />
            )}
            {props.type === 'payout' && detailsData && <PayoutData payout={detailsData as IPayoutDetails} isFetching={isFetching} />}
        </div>
    );
}
