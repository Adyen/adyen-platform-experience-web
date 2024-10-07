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
import { IDynamicOfferConfig, IGrant } from '../../../../../types';
import './CapitalOverview.scss';
import Unqualified from '../Unqualified';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type CapitalOverviewState = 'Loading' | 'Unqualified' | 'PreQualified' | 'GrantList' | 'CapitalOffer';

export const CapitalOverview: FunctionalComponent<ExternalUIComponentProps<CapitalOverviewProps>> = ({
    hideTitle,
    skipPreQualifiedIntro,
    onReviewOptions,
    onOfferSigned,
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

    const [requestedGrant, setRequestdGrant] = useState<IGrant>();
    const grantList = useMemo(() => (requestedGrant ? [requestedGrant] : grantsQuery.data?.data), [grantsQuery.data?.data, requestedGrant]);

    const onOfferSignedHandler = useCallback(
        (data: IGrant) => {
            onOfferSigned ? onOfferSigned(data, () => setRequestdGrant(data)) : setRequestdGrant(data);
        },
        [onOfferSigned]
    );

    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(!!skipPreQualifiedIntro);
    const onReviewOfferOptionsHandler = useCallback(() => {
        onReviewOptions ? onReviewOptions(() => setCapitalOfferSelection(true)) : setCapitalOfferSelection(true);
    }, [onReviewOptions]);

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
                                onReviewOfferOptions={onReviewOfferOptionsHandler}
                            />
                        );
                    case 'Unqualified':
                        return <Unqualified hideTitle={hideTitle} />;
                    case 'CapitalOffer':
                        return <CapitalOffer onOfferSigned={onOfferSignedHandler} onBack={goBackToPrequalified} />;
                    default:
                        return null;
                }
            })()}
        </div>
    );
};
