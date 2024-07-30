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
import useBalanceAccounts from '../../hooks/useBalanceAccounts';
import { ExternalUIComponentProps } from '../../types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import Spinner from '../Spinner';
import { DetailsComponentProps, DetailsWithId, TransactionDetailData } from './types';
import Typography from '../Typography/Typography';
import { TypographyVariant } from '../Typography/types';
import { useTranslation } from 'react-i18next';

const ENDPOINTS_BY_TYPE = {
    transaction: 'getTransaction',
    payout: 'getPayout',
} as const;

const TITLES_BY_TYPE = {
    transaction: 'transactionDetails',
    payout: 'payoutDetails',
} as const;

const isDetailsWithId = (props: DetailsComponentProps): props is DetailsWithId => !('data' in props);

export default function DataOverviewDetails(props: ExternalUIComponentProps<DetailsComponentProps>) {
    const details = useMemo(() => (isDetailsWithId(props) ? null : props.data), [props]);
    const dataId = useMemo(() => (isDetailsWithId(props) ? props.id : null), [props]);

    const { t } = useTranslation();
    const getDetail = useAuthContext().endpoints[ENDPOINTS_BY_TYPE[props.type]] as any; // [TODO]: Fix type and remove 'as any'
    const titleKey = useMemo(() => TITLES_BY_TYPE[props.type], [props.type]);

    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!dataId && !!getDetail },
                queryFn: async () => {
                    const queryParam =
                        props.type === 'transaction'
                            ? {
                                  path: { transactionId: dataId },
                              }
                            : {
                                  query: { balanceAccountId: dataId, createdAt: props.date },
                              };

                    return getDetail!(EMPTY_OBJECT, { ...queryParam });
                },
            }),
            [dataId, getDetail, props]
        )
    );

    const balanceAccountId = props.type === 'payout' ? props.balanceAccountDescription : data?.balanceAccountId;
    const hasBalanceAccountDetail = props.type === 'payout' ? props?.balanceAccountDescription : details?.balanceAccountDescription;
    const { balanceAccounts } = useBalanceAccounts(balanceAccountId, !hasBalanceAccountDetail);

    const errorProps = useMemo(() => {
        if (error) {
            return getErrorMessage(error as AdyenPlatformExperienceError, 'weCouldNotLoadYourTransactions', props.onContactSupport);
        }
    }, [error, props.onContactSupport]);

    const detailsData = details ?? data;

    if (isFetching) {
        return <Spinner />;
    }

    return (
        <div className="adyen-pe-overview-details">
            {!props.hideTitle && (
                <div className="adyen-pe-overview-details--title">
                    <Typography variant={TypographyVariant.TITLE} medium>
                        {t(titleKey)}
                    </Typography>
                </div>
            )}

            {error && errorProps && (
                <div className="adyen-pe-overview-details--error-container">
                    <ErrorMessageDisplay centered withImage {...errorProps} />
                </div>
            )}

            {props.type === 'transaction' && detailsData && (
                <TransactionData
                    transaction={
                        {
                            ...detailsData,
                            balanceAccountDescription: details?.balanceAccountDescription || balanceAccounts?.[0]?.description,
                        } as TransactionDetailData
                    }
                    isFetching={isFetching}
                />
            )}
            {props.type === 'payout' && detailsData && (
                <PayoutData
                    balanceAccountId={dataId!}
                    payout={detailsData as IPayoutDetails}
                    balanceAccountDescription={props?.balanceAccountDescription || balanceAccounts?.[0]?.description}
                    isFetching={isFetching}
                />
            )}
        </div>
    );
}
