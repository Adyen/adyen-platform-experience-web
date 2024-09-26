import { useMemo } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../types';
import { CapitalOverviewProps } from '../types';
import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../constants';
import { FunctionalComponent } from 'preact';
import { useAuthContext } from '../../../../core/Auth';
import { useFetch } from '../../../../hooks/useFetch/useFetch';
import { EMPTY_OBJECT } from '../../../../utils';
import { CapitalHeader } from '../../../internal/CapitalHeader';

export const CapitalOverview: FunctionalComponent<ExternalUIComponentProps<CapitalOverviewProps>> = ({ hideTitle, skipPreQualifiedIntro }) => {
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

    const dynamicOffer = useMemo(() => dynamicOfferQuery.data, [dynamicOfferQuery.data]);
    const grantList = useMemo(() => grantsQuery.data?.data, [grantsQuery.data]);

    return (
        <div className={CAPITAL_OVERVIEW_CLASS_NAMES.base}>
            <CapitalHeader hideTitle={hideTitle} titleKey={grantList?.length ? 'capital.grants' : 'capital.grantOffer'} />
            {grantList?.length ? (
                <div>{'Placeholder for grants list'}</div>
            ) : dynamicOffer?.maxAmount ? (
                <div>{'Placeholder for prequalified component'}</div>
            ) : null}
        </div>
    );
};
