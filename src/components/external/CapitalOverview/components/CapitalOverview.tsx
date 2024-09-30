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

export const CapitalOverview: FunctionalComponent<ExternalUIComponentProps<CapitalOverviewProps>> = ({
    hideTitle,
    skipPreQualifiedIntro,
    onOfferReview,
}) => {
    const { getGrants: grantsEndpointCall, getDynamicGrantOffersConfiguration: dynamicConfigurationEndpointCall } = useAuthContext().endpoints;

    const grantsQuery = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: true },
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
                fetchOptions: { enabled: true },
                queryFn: async () => {
                    return dynamicConfigurationEndpointCall?.(EMPTY_OBJECT);
                },
            }),
            [dynamicConfigurationEndpointCall]
        )
    );

    const dynamicOffer = dynamicOfferQuery.data;
    const grantList = grantsQuery.data?.data;

    const showPreQualified = dynamicOffer?.maxAmount && !skipPreQualifiedIntro;
    const showGrantsList = grantList?.length;
    const showSkeleton = grantsQuery.isFetching || dynamicOfferQuery.isFetching;

    return (
        <div className={CAPITAL_OVERVIEW_CLASS_NAMES.base}>
            <CapitalHeader hideTitle={hideTitle} hasSubtitle={false} titleKey={grantList?.length ? 'capital.grants' : 'capital.grantOffer'} />
            {showSkeleton && <div className={CAPITAL_OVERVIEW_CLASS_NAMES.skeleton}></div>}
            {!showSkeleton &&
                (showGrantsList ? (
                    <div>{'Placeholder for grants list'}</div>
                ) : showPreQualified ? (
                    <PreQualified dynamicOffer={dynamicOffer} onOfferReview={onOfferReview} />
                ) : null)}
        </div>
    );
};
