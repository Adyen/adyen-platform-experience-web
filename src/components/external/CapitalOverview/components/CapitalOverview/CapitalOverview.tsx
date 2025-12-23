import { useCallback, useMemo, useState } from 'preact/hooks';
import { isCapitalRegionSupported } from '../../../../internal/CapitalHeader/helpers';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalErrorMessageDisplay } from '../../../CapitalOffer/components/utils/CapitalErrorMessageDisplay';
import { CapitalOverviewProps } from '../../types';
import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../../constants';
import { FunctionalComponent } from 'preact';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { IGrant } from '../../../../../types';
import './CapitalOverview.scss';
import Unqualified from '../Unqualified';
import { PreQualified } from '../PreQualified/PreQualified';
import { GrantList } from '../GrantList/GrantList';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { getCapitalErrorMessage } from '../../../../utils/capital/getCapitalErrorMessage';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';

type CapitalOverviewState = 'Loading' | 'Error' | 'Unqualified' | 'PreQualified' | 'GrantList' | 'UnsupportedRegion';

export const CapitalOverview: FunctionalComponent<ExternalUIComponentProps<CapitalOverviewProps>> = ({
    hideTitle,
    onContactSupport,
    onFundsRequest,
    onOfferDismiss,
    onOfferOptionsRequest,
    skipPreQualifiedIntro,
}) => {
    const legalEntity = useConfigContext()?.extraConfig?.legalEntity;
    const isRegionSupported = useMemo(() => isCapitalRegionSupported(legalEntity), [legalEntity]);

    const { getGrants: grantsEndpointCall, getDynamicGrantOffersConfiguration: dynamicConfigurationEndpointCall } = useConfigContext().endpoints;

    const grantsQuery = useFetch({
        fetchOptions: { enabled: !!grantsEndpointCall && isRegionSupported },
        queryFn: useCallback(async () => {
            return grantsEndpointCall?.(EMPTY_OBJECT);
        }, [grantsEndpointCall]),
    });

    const dynamicOfferQuery = useFetch({
        fetchOptions: { enabled: !!dynamicConfigurationEndpointCall && isRegionSupported },
        queryFn: useCallback(async () => {
            return dynamicConfigurationEndpointCall?.(EMPTY_OBJECT);
        }, [dynamicConfigurationEndpointCall]),
    });

    const dynamicOffer = dynamicOfferQuery.data;

    const [requestedGrant, setRequestedGrant] = useState<IGrant>();
    const grantList = useMemo(
        () => (requestedGrant ? [requestedGrant, ...(grantsQuery.data?.data || [])] : grantsQuery.data?.data),
        [grantsQuery.data?.data, requestedGrant]
    );

    const handlePreQualifiedFundsRequest = useCallback(
        (data: IGrant) => {
            onFundsRequest ? onFundsRequest(data) : setRequestedGrant(data);
        },
        [onFundsRequest]
    );

    const showError = useMemo(() => {
        if (dynamicOfferQuery.error && grantsQuery.error) return true;
        if (dynamicOfferQuery.error && !grantList?.length) return true;
        return false;
    }, [dynamicOfferQuery.error, grantList?.length, grantsQuery.error]);

    const state = useMemo<CapitalOverviewState>(() => {
        if (!isRegionSupported) {
            return 'UnsupportedRegion';
        } else if (showError) {
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
        } else if (dynamicOffer?.maxAmount && dynamicOffer?.minAmount) {
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
        isRegionSupported,
    ]);

    const newOfferAvailable = useMemo(() => !!(dynamicOffer && dynamicOffer.minAmount && dynamicOffer.maxAmount), [dynamicOffer]);

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
                            <div className={CAPITAL_OVERVIEW_CLASS_NAMES.errorContainer}>
                                <CapitalHeader hideTitle={hideTitle} titleKey={'capital.common.title'} />
                                <ErrorMessageDisplay
                                    absolutePosition={false}
                                    outlined={false}
                                    withImage
                                    onContactSupport={onContactSupport}
                                    {...getCapitalErrorMessage(dynamicOfferQuery.error as AdyenPlatformExperienceError, onContactSupport)}
                                />
                            </div>
                        );
                    case 'GrantList':
                        return (
                            grantList && (
                                <GrantList
                                    externalDynamicOffersConfig={dynamicOffer}
                                    grantList={grantList}
                                    hideTitle={hideTitle}
                                    newOfferAvailable={newOfferAvailable}
                                    onFundsRequest={onFundsRequest}
                                    onGrantListUpdateRequest={setRequestedGrant}
                                    onOfferDismiss={onOfferDismiss}
                                />
                            )
                        );
                    case 'PreQualified':
                        return (
                            <PreQualified
                                onOfferDismiss={onOfferDismiss}
                                onOfferOptionsRequest={onOfferOptionsRequest}
                                skipPreQualifiedIntro={skipPreQualifiedIntro}
                                hideTitle={hideTitle}
                                dynamicOffer={dynamicOffer!}
                                onFundsRequest={handlePreQualifiedFundsRequest}
                            />
                        );
                    case 'Unqualified':
                        return <Unqualified hideTitle={hideTitle} />;
                    case 'UnsupportedRegion':
                        return (
                            <div className={CAPITAL_OVERVIEW_CLASS_NAMES.errorContainer}>
                                <CapitalHeader hideTitle={hideTitle} titleKey={'capital.common.title'} />
                                <CapitalErrorMessageDisplay unsupportedRegion />
                            </div>
                        );
                    default:
                        return null;
                }
            })()}
        </div>
    );
};
