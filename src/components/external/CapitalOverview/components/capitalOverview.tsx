import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import Typography from '../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../internal/Typography/types';
import { ExternalUIComponentProps } from '../../../types';
import { CapitalOverviewProps } from '../types';
import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../constants';
import { FunctionalComponent } from 'preact';
import { useAuthContext } from '../../../../core/Auth';
import { useFetch } from '../../../../hooks/useFetch/useFetch';
import { EMPTY_OBJECT } from '../../../../utils';

export const CapitalOverview: FunctionalComponent<ExternalUIComponentProps<CapitalOverviewProps>> = ({ hideTitle, skipPreQualifiedAlert }) => {
    const { i18n } = useCoreContext();

    const { getGrants: grantsEndpointCall, getCapitalDynamicConfiguration: dynamicConfigurationEndpointCall } = useAuthContext().endpoints;

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
    const grantList = useMemo(() => grantsQuery.data, [grantsQuery.data]);

    return (
        <div className={CAPITAL_OVERVIEW_CLASS_NAMES.base}>
            {!hideTitle && (
                <div className={CAPITAL_OVERVIEW_CLASS_NAMES.title}>
                    <Typography variant={TypographyVariant.TITLE} medium>
                        {i18n.get(grantList?.length ? 'capital.grants' : 'capital.grantOffer')}
                    </Typography>
                </div>
            )}
            {grantList?.length ? (
                <div>{'Placeholder for grants list'}</div>
            ) : dynamicOffer?.maxAmount ? (
                <div>{'Placeholder for prequalified component'}</div>
            ) : null}
        </div>
    );
};
