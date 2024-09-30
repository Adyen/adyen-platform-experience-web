import { useMemo } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../types';
import { CapitalOverviewProps } from '../types';
import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../constants';
import { FunctionalComponent } from 'preact';
import { useAuthContext } from '../../../../core/Auth';
import { useFetch } from '../../../../hooks/useFetch/useFetch';
import { EMPTY_OBJECT } from '../../../../utils';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import '../CapitalOverview.scss';
import PreQualified from './PreQualified';
import { IDynamicOfferConfig } from '../../../../types';

export const CapitalOverview: FunctionalComponent<ExternalUIComponentProps<CapitalOverviewProps>> = ({
    hideTitle,
    skipPreQualifiedIntro,
    onOfferReview,
}) => {
    const { getGrants: grantsEndpointCall, getDynamicGrantOffersConfiguration: dynamicConfigurationEndpointCall } = useAuthContext().endpoints;

    const grantsQuery = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!grantsEndpointCall },
                queryFn: async () => {
                    return grantsEndpointCall?.(EMPTY_OBJECT);
                },
            }),
            [grantsEndpointCall]
        )
    );

    const dynamicOfferQuery = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!dynamicConfigurationEndpointCall },
                queryFn: async () => {
                    return dynamicConfigurationEndpointCall?.(EMPTY_OBJECT);
                },
            }),
            [dynamicConfigurationEndpointCall]
        )
    );

    const dynamicOffer = dynamicOfferQuery.data;
    const grantList = grantsQuery.data?.data;

    const showPreQualified = dynamicOffer?.maxAmount && dynamicOffer?.minAmount && !skipPreQualifiedIntro;
    const showGrantsList = grantList?.length;
    const showSkeleton =
        (!grantsEndpointCall && !dynamicConfigurationEndpointCall) ||
        (!dynamicOffer && !grantList) ||
        grantsQuery.isFetching ||
        dynamicOfferQuery.isFetching;

    return (
        <div className={CAPITAL_OVERVIEW_CLASS_NAMES.base}>
            <CapitalHeader hideTitle={hideTitle} hasSubtitle={false} titleKey={grantList?.length ? 'capital.grants' : 'capital.grantOffer'} />
            {showSkeleton ? <div className={CAPITAL_OVERVIEW_CLASS_NAMES.skeleton}></div> : null}
            {!showSkeleton &&
                (showGrantsList ? (
                    <div>{'Placeholder for grants list'}</div>
                ) : showPreQualified ? (
                    <PreQualified dynamicOffer={dynamicOffer as Required<IDynamicOfferConfig>} onOfferReview={onOfferReview} />
                ) : null)}
        </div>
    );
};
