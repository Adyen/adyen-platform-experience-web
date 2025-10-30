import './DataOverviewDetails.scss';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../core/ConfigContext';
import { useModalContext } from '../Modal/Modal';
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { useFetch } from '../../../hooks/useFetch';
import { IBalanceAccountBase, IPayoutDetails } from '../../../types';
import { EMPTY_OBJECT } from '../../../utils';
import { PayoutData } from '../../external/PayoutDetails/components/PayoutData';
import TransactionData from '../../external/TransactionDetails/components/TransactionData';
import useBalanceAccounts from '../../../hooks/useBalanceAccounts';
import { CustomColumn, ExternalUIComponentProps } from '../../types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { DetailsComponentProps, DetailsWithId, TransactionDetailData } from './types';
import useDataOverviewDetailsTitle from './useDataOverviewDetailsTitle';
import { TX_DETAILS_RESERVED_FIELDS_SET } from '../../external/TransactionDetails/components/constants';
import { PAYOUT_TABLE_FIELDS } from '../../external/PayoutsOverview/components/PayoutsTable/PayoutsTable';
import { TransactionDetailsCustomization } from '../../external';
import { PayoutDetailsCustomization } from '../../external/PayoutDetails/types';
import { TranslationKey } from '../../../translations';
import { Header } from '../Header';

const ENDPOINTS_BY_TYPE = {
    transaction: 'getTransaction',
    payout: 'getPayout',
} as const;

const isDetailsWithId = (props: DetailsComponentProps): props is DetailsWithId => !('data' in props);

export default function DataOverviewDetails(props: ExternalUIComponentProps<DetailsComponentProps> & { balanceAccount?: IBalanceAccountBase }) {
    const details = useMemo(() => (isDetailsWithId(props) ? null : props.data), [props]);
    const dataId = useMemo(() => (isDetailsWithId(props) ? props.id : null), [props]);
    const getDetail = useConfigContext().endpoints[ENDPOINTS_BY_TYPE[props.type]] as any; // [TODO]: Fix type and remove 'as any'

    const { hideTitle, titleKey } = useDataOverviewDetailsTitle(props);
    const { withinModal } = useModalContext();

    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!dataId && !!getDetail },
                queryFn: async () => {
                    let queryParam = null;
                    switch (props.type) {
                        case 'transaction':
                            queryParam = { path: { transactionId: dataId } };
                            break;
                        case 'payout':
                            queryParam = { query: { balanceAccountId: dataId, createdAt: props.date } };
                            break;
                        default:
                            break;
                    }
                    return getDetail!(EMPTY_OBJECT, { ...queryParam });
                },
            }),
            [dataId, getDetail, props]
        )
    );

    const balanceAccountId = props.type === 'payout' ? props.id : data?.balanceAccountId;
    const hasBalanceAccountDetail = props.type === 'payout' ? props?.balanceAccountDescription : props?.balanceAccount;
    const { balanceAccounts } = useBalanceAccounts(balanceAccountId, !hasBalanceAccountDetail);

    const errorProps = useMemo(() => {
        if (error) {
            let errorMessageKey!: TranslationKey;
            switch (props.type) {
                case 'transaction':
                    errorMessageKey = 'transactions.details.errors.unavailable';
                    break;
                case 'payout':
                    errorMessageKey = 'payouts.details.errors.unavailable';
                    break;
                default:
                    break;
            }
            return getErrorMessage(error as AdyenPlatformExperienceError, errorMessageKey, props.onContactSupport);
        }
    }, [error, props.onContactSupport, props.type]);

    const detailsData = details ?? data;

    const [extraFields, setExtraFields] = useState<Record<string, any>>();

    const getExtraFields = useCallback(async () => {
        if (data && ((isDetailsWithId(props) && props.type === 'transaction') || props.type === 'payout')) {
            const detailsData = await props.dataCustomization?.details?.onDataRetrieve?.(data);

            setExtraFields(
                props.dataCustomization?.details?.fields.reduce((acc, field) => {
                    return TX_DETAILS_RESERVED_FIELDS_SET.has(field.key as any) ||
                        PAYOUT_TABLE_FIELDS.includes(field.key as any) ||
                        field?.visibility === 'hidden'
                        ? acc
                        : { ...acc, ...(detailsData?.[field.key] ? { [field.key]: detailsData[field.key] } : {}) };
                }, {} as CustomColumn<any>)
            );
        }
    }, [data, props]);

    const dataCustomization =
        (isDetailsWithId(props) && props.type === 'transaction') || props.type === 'payout' ? props.dataCustomization : undefined;

    useEffect(() => {
        void getExtraFields();
    }, [getExtraFields]);

    return (
        <div className="adyen-pe-overview-details">
            <Header hideTitle={hideTitle} titleKey={titleKey} forwardedToRoot={!withinModal} />

            {error && errorProps && (
                <div className="adyen-pe-overview-details--error-container">
                    <ErrorMessageDisplay withImage {...errorProps} />
                </div>
            )}

            {props.type === 'transaction' && (
                <TransactionData
                    transaction={
                        detailsData
                            ? ({
                                  ...(detailsData || EMPTY_OBJECT),
                                  balanceAccount: props?.balanceAccount || balanceAccounts?.[0],
                              } as TransactionDetailData)
                            : undefined
                    }
                    error={!!(error && errorProps)}
                    isFetching={isFetching}
                    extraFields={extraFields}
                    dataCustomization={dataCustomization as { details?: TransactionDetailsCustomization }}
                />
            )}
            {props.type === 'payout' && detailsData && (
                <PayoutData
                    balanceAccountId={dataId!}
                    payout={detailsData as IPayoutDetails}
                    balanceAccountDescription={props?.balanceAccountDescription || balanceAccounts?.[0]?.description}
                    isFetching={isFetching}
                    extraFields={extraFields}
                    dataCustomization={dataCustomization as { details?: PayoutDetailsCustomization }}
                />
            )}
        </div>
    );
}
