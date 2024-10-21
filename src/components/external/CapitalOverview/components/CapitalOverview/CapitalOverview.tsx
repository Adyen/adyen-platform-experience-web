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
import { IGrant } from '../../../../../types';
import './CapitalOverview.scss';
import Unqualified from '../Unqualified';
import { PreQualified } from '../PreQualified/PreQualified';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { getCapitalErrorMessage } from '../../../../utils/capital/getCapitalErrorMessage';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';

type CapitalOverviewState = 'Loading' | 'Error' | 'Unqualified' | 'PreQualified' | 'GrantList';

export const CapitalOverview: FunctionalComponent<ExternalUIComponentProps<CapitalOverviewProps>> = ({
    hideTitle,
    skipPreQualifiedIntro,
    onRequestFunds,
    onSeeOptions,
    onOfferDismissed,
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

    const [requestedGrant, setRequestedGrant] = useState<IGrant>();
    const grantList = useMemo(() => (requestedGrant ? [requestedGrant] : grantsQuery.data?.data), [grantsQuery.data?.data, requestedGrant]);

    const onRequestFundsHandler = useCallback(
        (data: IGrant) => {
            onRequestFunds ? onRequestFunds(data, () => setRequestedGrant(data)) : setRequestedGrant(data);
        },
        [onRequestFunds]
    );

    const showError = useMemo(() => {
        if (dynamicOfferQuery.error && grantsQuery.error) return true;
        if (dynamicOfferQuery.error && !grantList?.length) return true;
        return false;
    }, [dynamicOfferQuery.error, grantList?.length, grantsQuery.error]);

    const state = useMemo<CapitalOverviewState>(() => {
        if (showError) {
            return 'Error';
        } else if (
            (!grantsEndpointCall && !dynamicConfigurationEndpointCall) ||
            (!dynamicOffer && !grantList) ||
            grantsQuery.isFetching ||
            dynamicOfferQuery.isFetching
        ) {
            return 'Loading';
        } else if (grantList?.length) {
            return 'GrantList';
        } else if (dynamicOffer?.maxAmount && dynamicOffer?.minAmount && !skipPreQualifiedIntro) {
            return 'PreQualified';
        }
        return 'Unqualified';
    }, [
        dynamicConfigurationEndpointCall,
        dynamicOffer,
        dynamicOfferQuery.isFetching,
        grantList,
        grantsEndpointCall,
        grantsQuery.isFetching,
        showError,
        skipPreQualifiedIntro,
    ]);

    return (
        <div className={CAPITAL_OVERVIEW_CLASS_NAMES.base}>
            {(() => {
                switch (state) {
                    case 'Loading':
                        return (
                            <div className={CAPITAL_OVERVIEW_CLASS_NAMES.skeletonContainer}>
                                <div className={CAPITAL_OVERVIEW_CLASS_NAMES.headerSkeleton}></div>
                                <div className={CAPITAL_OVERVIEW_CLASS_NAMES.skeleton}></div>
                            </div>
                        );
                    case 'Error':
                        return (
                            <div>
                                <CapitalHeader hideTitle={hideTitle} titleKey={'capital.businessFinancing'} />
                                <ErrorMessageDisplay
                                    absolutePosition={false}
                                    outlined={false}
                                    withImage
                                    {...getCapitalErrorMessage(dynamicOfferQuery.error as AdyenPlatformExperienceError)}
                                />
                            </div>
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
                                onOfferDismissed={onOfferDismissed}
                                onSeeOptions={onSeeOptions}
                                skipPreQualifiedIntro={skipPreQualifiedIntro}
                                hideTitle={hideTitle}
                                dynamicOffer={dynamicOffer!}
                                onRequestFundsHandler={onRequestFundsHandler}
                            />
                        );
                    case 'Unqualified':
                        return <Unqualified hideTitle={hideTitle} />;
                    default:
                        return null;
                }
            })()}
        </div>
    );
};
