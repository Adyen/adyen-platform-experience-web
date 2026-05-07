import './DataOverviewDetails.scss';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '@integration-components/core/preact';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import type { TranslationKey } from '@integration-components/core';
import type { CustomColumn, ExternalUIComponentProps, IPayoutDetails } from '@integration-components/types';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { useBalanceAccounts, useFetch } from '@integration-components/hooks-preact';
import type { PayoutDetailsCustomization } from '@integration-components/payouts/domain';
import { useModalContext } from '@integration-components/ui-primitives-preact/Modal/Modal';
import { getErrorMessage } from '../../../../../../../src/components/utils/getErrorMessage';
import { ErrorMessageDisplay } from '@integration-components/ui-primitives-preact/ErrorMessageDisplay/ErrorMessageDisplay';
import { Header } from '@integration-components/ui-primitives-preact/Header';
import { PayoutData } from '../../PayoutDetails/components/PayoutData';
import { PAYOUT_TABLE_FIELDS } from '../../PayoutsOverview/components/PayoutsTable/PayoutsTable';
import { DetailsComponentProps } from './types';
import useDataOverviewDetailsTitle from './useDataOverviewDetailsTitle';

const ENDPOINTS_BY_TYPE = {
    payout: 'getPayout',
} as const;

export default function DataOverviewDetails(props: ExternalUIComponentProps<DetailsComponentProps>) {
    const getDetail = useConfigContext().endpoints[ENDPOINTS_BY_TYPE[props.type]];
    const { hideTitle, titleKey } = useDataOverviewDetailsTitle(props);
    const { withinModal } = useModalContext();

    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!props.id && !!getDetail },
                queryFn: async () => {
                    switch (props.type) {
                        case 'payout': {
                            const queryParam = { query: { balanceAccountId: props.id, createdAt: props.date } };
                            return getDetail!(EMPTY_OBJECT, { ...queryParam });
                        }
                    }
                },
            }),
            [getDetail, props]
        )
    );

    const balanceAccountId = props.id;
    const hasBalanceAccountDetail = props?.balanceAccountDescription;
    const { balanceAccounts } = useBalanceAccounts(balanceAccountId, !hasBalanceAccountDetail);

    const errorProps = useMemo(() => {
        if (error) {
            let errorMessageKey!: TranslationKey;
            switch (props.type) {
                case 'payout':
                    errorMessageKey = 'payouts.details.errors.unavailable';
                    break;
            }
            return getErrorMessage(error as AdyenPlatformExperienceError, errorMessageKey, props.onContactSupport);
        }
    }, [error, props.onContactSupport, props.type]);

    const detailsData = data;

    const [extraFields, setExtraFields] = useState<Record<string, any>>();

    const getExtraFields = useCallback(async () => {
        if (data) {
            const detailsData = await props.dataCustomization?.details?.onDataRetrieve?.(data);

            setExtraFields(
                props.dataCustomization?.details?.fields?.reduce((acc, field) => {
                    return PAYOUT_TABLE_FIELDS.includes(field.key as any) || field?.visibility === 'hidden'
                        ? acc
                        : { ...acc, ...(detailsData?.[field.key] ? { [field.key]: detailsData[field.key] } : {}) };
                }, {} as CustomColumn<any>)
            );
        }
    }, [data, props]);

    const dataCustomization = props.dataCustomization;

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

            {props.type === 'payout' && detailsData && (
                <PayoutData
                    balanceAccountId={balanceAccountId}
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
