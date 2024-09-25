import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { ExternalUIComponentProps } from '../../../types';
import { CapitalOverviewProps } from '../types';
import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../constants';
import { FunctionalComponent } from 'preact';
import { useAuthContext } from '../../../../core/Auth';
import { useFetch } from '../../../../hooks/useFetch/useFetch';
import { EMPTY_OBJECT } from '../../../../utils';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import InfoBox from '../../../internal/InfoBox';
import Button from '../../../internal/Button';
import '../CapitalOverview.scss';

export const CapitalOverview: FunctionalComponent<ExternalUIComponentProps<CapitalOverviewProps>> = ({
    hideTitle,
    skipPreQualifiedIntro,
    onOfferReview,
}) => {
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

    const dynamicOffer = dynamicOfferQuery.data;
    const grantList = grantsQuery.data;

    const showPreQualified = dynamicOffer?.maxAmount && !skipPreQualifiedIntro;
    const showGrantsList = grantList?.length;
    const showSkeleton = grantsQuery.isFetching || dynamicOfferQuery.isFetching;

    // TODO: Implement this function
    const goToNextStep = useCallback(() => console.log('goToNextStep'), []);

    const onReviewOptions = useMemo(() => (onOfferReview ? onOfferReview : goToNextStep), [goToNextStep, onOfferReview]);

    return (
        <div className={CAPITAL_OVERVIEW_CLASS_NAMES.base}>
            <CapitalHeader hideTitle={hideTitle} hasSubtitle={false} titleKey={grantList?.length ? 'capital.grants' : 'capital.grantOffer'} />
            {showSkeleton && <div className={CAPITAL_OVERVIEW_CLASS_NAMES.skeleton}></div>}
            {!showSkeleton &&
                (showGrantsList ? (
                    <div>{'Placeholder for grants list'}</div>
                ) : showPreQualified ? (
                    <div className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrant}>
                        <InfoBox>
                            <div>
                                {i18n.get('capital.preQualifiedToReceiveFunds')}
                                <strong>
                                    {i18n.get('capital.upTo', {
                                        values: { amount: i18n.amount(dynamicOffer.maxAmount.value, dynamicOffer.maxAmount.currency) },
                                    })}
                                </strong>
                            </div>
                        </InfoBox>
                        <Button className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrantButton} onClick={onReviewOptions}>
                            {i18n.get('capital.reviewOptions')}
                        </Button>
                    </div>
                ) : null)}
        </div>
    );
};
