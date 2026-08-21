import { useCallback, useMemo, useState } from 'preact/hooks';
import { getEnhancedCapitalState, OnFundsRequestCallback, shouldGetGrants, getAdjustedGrants } from '@integration-components/capital/domain';
import { ExternalUIComponentProps, IGrant } from '@integration-components/types';
import { useConfigContext } from '@integration-components/core/preact';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import { useFetch } from '@integration-components/hooks-preact';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { CapitalErrorMessageDisplay } from '../../../internal/CapitalErrorMessageDisplay';
import { CapitalOverviewProps } from '../../types';
import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../../constants';
import { FunctionalComponent } from 'preact';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import './CapitalOverview.scss';
import { PreQualified } from '../PreQualified/PreQualified';
import { GrantList } from '../GrantList/GrantList';
import { ErrorMessageDisplay } from '@integration-components/ui-components-preact/ErrorMessageDisplay/ErrorMessageDisplay';
import { getEnhancedCapitalErrorMessage } from '../../../utils/capital/getEnhancedCapitalErrorMessage';
import { useSupportedRegions } from '../../../utils/capital/useSupportedRegions';

type CapitalOverviewState = 'Loading' | 'Error' | 'PreQualified' | 'GrantList' | 'UnsupportedRegion';

export const CapitalOverview: FunctionalComponent<ExternalUIComponentProps<CapitalOverviewProps>> = ({
    hideTitle,
    onContactSupport,
    onFundsRequest,
    onOfferDismiss,
    onOfferOptionsRequest,
    skipPreQualifiedIntro,
}) => {
    const { getCapitalState: capitalStateEndpointCall, getGrants: grantsEndpointCall } = useConfigContext().endpoints;
    const supportedRegions = useSupportedRegions();
    const [requestedGrant, setRequestedGrant] = useState<IGrant>();

    const capitalStateQuery = useFetch({
        fetchOptions: { enabled: !!capitalStateEndpointCall },
        queryFn: useCallback(async () => {
            return capitalStateEndpointCall?.(EMPTY_OBJECT, { query: EMPTY_OBJECT });
        }, [capitalStateEndpointCall]),
    });

    const capitalState = useMemo(
        () => getEnhancedCapitalState(capitalStateQuery.data, supportedRegions, requestedGrant),
        [capitalStateQuery.data, requestedGrant, supportedRegions]
    );

    const grantsQuery = useFetch({
        fetchOptions: {
            enabled: !!grantsEndpointCall && shouldGetGrants(capitalStateQuery.data, !!capitalState?.isRegionSupported),
        },
        queryFn: useCallback(async () => {
            return grantsEndpointCall?.(EMPTY_OBJECT);
        }, [grantsEndpointCall]),
    });

    const error = capitalStateQuery.error ?? grantsQuery.error;
    const grants = useMemo(() => getAdjustedGrants(capitalState, grantsQuery.data, requestedGrant), [capitalState, grantsQuery.data, requestedGrant]);

    const handlePreQualifiedFundsRequest = useCallback<OnFundsRequestCallback>(
        (data, renewsGrantId) => {
            if (onFundsRequest) {
                onFundsRequest(data, renewsGrantId);
            } else {
                setRequestedGrant({ ...data, renewsGrantId });
            }
        },
        [onFundsRequest]
    );

    const state = useMemo<CapitalOverviewState>(() => {
        if (error) {
            return 'Error';
        } else if ((!capitalStateEndpointCall && !grantsEndpointCall) || capitalStateQuery.isFetching || grantsQuery.isFetching) {
            return 'Loading';
        } else if (capitalState && !capitalState.isRegionSupported) {
            return 'UnsupportedRegion';
        }
        return capitalState?.hasGrants ? 'GrantList' : 'PreQualified';
    }, [capitalState, capitalStateEndpointCall, capitalStateQuery.isFetching, error, grantsEndpointCall, grantsQuery.isFetching]);

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
                                <CapitalHeader hideTitle={hideTitle} region={capitalState?.region} titleKey={'capital.common.title'} />
                                <ErrorMessageDisplay
                                    absolutePosition={false}
                                    outlined={false}
                                    withImage
                                    onContactSupport={onContactSupport}
                                    {...getEnhancedCapitalErrorMessage(error as AdyenPlatformExperienceError, onContactSupport)}
                                />
                            </div>
                        );
                    case 'UnsupportedRegion':
                        return (
                            <div className={CAPITAL_OVERVIEW_CLASS_NAMES.errorContainer}>
                                <CapitalHeader hideTitle={hideTitle} region={capitalState?.region} titleKey={'capital.common.title'} />
                                <CapitalErrorMessageDisplay unsupportedRegion />
                            </div>
                        );
                    case 'PreQualified':
                        return (
                            <PreQualified
                                onOfferDismiss={onOfferDismiss}
                                onOfferOptionsRequest={onOfferOptionsRequest}
                                skipPreQualifiedIntro={skipPreQualifiedIntro}
                                hideTitle={hideTitle}
                                capitalState={capitalState!}
                                onFundsRequest={handlePreQualifiedFundsRequest}
                            />
                        );
                    case 'GrantList':
                        return (
                            grants && (
                                <GrantList
                                    capitalState={capitalState}
                                    grants={grants}
                                    hideTitle={hideTitle}
                                    onFundsRequest={onFundsRequest}
                                    onGrantListUpdateRequest={setRequestedGrant}
                                    onOfferDismiss={onOfferDismiss}
                                />
                            )
                        );
                }
            })()}
        </div>
    );
};
