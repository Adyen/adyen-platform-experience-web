import { useCallback, useMemo, useState } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOverviewProps } from '../../types';
import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../../constants';
import { FunctionalComponent } from 'preact';
import { useAuthContext } from '../../../../../core/Auth';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { GrantItem } from '../GrantItem/GrantItem';
import PreQualified from '../PreQualified';
import { IDynamicOfferConfig } from '../../../../../types';
import './CapitalOverview.scss';
import Unqualified from '../Unqualified';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type CapitalOverviewState = 'Loading' | 'Unqualified' | 'PreQualified' | 'GrantList' | 'CapitalOffer';

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

    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(!!skipPreQualifiedIntro);
    const onOfferReviewHandler = useCallback(() => {
        onOfferReview ? onOfferReview() : setCapitalOfferSelection(true);
    }, [onOfferReview]);

    const goBackToPrequalified = useCallback(() => {
        setCapitalOfferSelection(false);
    }, []);

    const state = useMemo<CapitalOverviewState>(() => {
        if (
            (!grantsEndpointCall && !dynamicConfigurationEndpointCall) ||
            (!dynamicOffer && !grantList) ||
            grantsQuery.isFetching ||
            dynamicOfferQuery.isFetching
        ) {
            return 'Loading';
        } else if (grantList?.length) {
            return 'GrantList';
        } else if (dynamicOffer?.maxAmount && dynamicOffer?.minAmount && !skipPreQualifiedIntro && !capitalOfferSelection) {
            return 'PreQualified';
        } else if (skipPreQualifiedIntro || capitalOfferSelection) {
            return 'CapitalOffer';
        }
        return 'Unqualified';
    }, [
        capitalOfferSelection,
        dynamicConfigurationEndpointCall,
        dynamicOffer,
        dynamicOfferQuery.isFetching,
        grantList,
        grantsEndpointCall,
        grantsQuery.isFetching,
        skipPreQualifiedIntro,
    ]);

    return (
        <div className={CAPITAL_OVERVIEW_CLASS_NAMES.base}>
            {(() => {
                switch (state) {
                    case 'Loading':
                        return (
                            <>
                                <div className={CAPITAL_OVERVIEW_CLASS_NAMES.headerSkeleton}></div>
                                <div className={CAPITAL_OVERVIEW_CLASS_NAMES.skeleton}></div>
                            </>
                        );
                    case 'GrantList':
                        return (
                            <div>
                                <CapitalHeader hideTitle={hideTitle} titleKey={'capital.businessFinancing'} />
                                <BaseList>
                                    {grantList?.map(grant => (
                                        <li key={grant.id}>
                                            <GrantItem grant={grant} />
                                        </li>
                                    ))}
                                </BaseList>
                            </div>
                        );
                    case 'PreQualified':
                        return (
                            <PreQualified
                                hideTitle={hideTitle}
                                dynamicOffer={dynamicOffer as Required<IDynamicOfferConfig>}
                                onOfferReview={onOfferReviewHandler}
                            />
                        );
                    case 'Unqualified':
                        return <Unqualified hideTitle={hideTitle} />;
                    case 'CapitalOffer':
                        return <CapitalOffer onOfferSigned={() => console.log('On offer signed callback')} onOfferDismissed={goBackToPrequalified} />;
                    default:
                        return null;
                }
            })()}
        </div>
    );
};
