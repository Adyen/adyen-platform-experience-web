import { useCallback, useMemo, useState } from 'preact/hooks';
import { isCapitalRegionSupported } from '../../../internal/CapitalHeader/helpers';
import { ExternalUIComponentProps, ICapitalState, IGrant } from '@integration-components/types';
import { useConfigContext } from '@integration-components/core/preact';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import { useFetch } from '@integration-components/hooks-preact';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { CapitalErrorMessageDisplay } from '../../../CapitalOffer/components/utils/CapitalErrorMessageDisplay';
import { CapitalOverviewProps } from '../../types';
import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../../constants';
import { FunctionalComponent } from 'preact';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import './CapitalOverview.scss';
import Unqualified from '../Unqualified';
import { PreQualified } from '../PreQualified/PreQualified';
import { GrantList } from '../GrantList/GrantList';
import { ErrorMessageDisplay } from '@integration-components/ui-components-preact/ErrorMessageDisplay/ErrorMessageDisplay';
import { getCapitalErrorMessage } from '../../../utils/capital/getCapitalErrorMessage';
import { getEnhancedCapitalState } from '../../../utils/capital/getCapitalState';
import { OnFundsRequestCallback } from '../../../types';

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

    const { getCapitalState: capitalStateEndpointCall, getGrants: grantsEndpointCall } = useConfigContext().endpoints;

    const capitalStateQuery = useFetch({
        fetchOptions: { enabled: isRegionSupported && !!capitalStateEndpointCall },
        queryFn: useCallback(async () => {
            return capitalStateEndpointCall?.(EMPTY_OBJECT, { query: EMPTY_OBJECT });
        }, [capitalStateEndpointCall]),
    });

    const [requestedGrant, setRequestedGrant] = useState<IGrant>();

    const capitalState = useMemo(
        () =>
            getEnhancedCapitalState(
                capitalStateQuery.data &&
                    ({
                        ...capitalStateQuery.data,
                        activeOrPendingGrants: requestedGrant
                            ? [requestedGrant, ...capitalStateQuery.data.activeOrPendingGrants]
                            : capitalStateQuery.data.activeOrPendingGrants,
                    } as ICapitalState)
            ),
        [capitalStateQuery.data, requestedGrant]
    );

    const hasGrantsOnServer = useMemo(
        () => !!(capitalStateQuery.data?.activeOrPendingGrants?.length || capitalStateQuery.data?.hasClosedGrants),
        [capitalStateQuery.data]
    );

    const grantsQuery = useFetch({
        fetchOptions: {
            enabled: isRegionSupported && hasGrantsOnServer && !!grantsEndpointCall,
        },
        queryFn: useCallback(async () => {
            return grantsEndpointCall?.(EMPTY_OBJECT);
        }, [grantsEndpointCall]),
    });

    const grantList = useMemo(() => {
        const grants = requestedGrant ? [requestedGrant, ...(grantsQuery.data?.data || [])] : grantsQuery.data?.data;
        return grants?.filter(grant => !capitalState.renewsGrantIds.has(grant.id));
    }, [capitalState.renewsGrantIds, grantsQuery.data?.data, requestedGrant]);

    const handlePreQualifiedFundsRequest = useCallback<OnFundsRequestCallback>(
        (data, renewsGrantId) => {
            if (onFundsRequest) {
                onFundsRequest(data);
            } else {
                setRequestedGrant({ ...data, renewsGrantId });
            }
        },
        [onFundsRequest]
    );

    const state = useMemo<CapitalOverviewState>(() => {
        if (!isRegionSupported) {
            return 'UnsupportedRegion';
        } else if (capitalStateQuery.error || grantsQuery.error) {
            return 'Error';
        } else if (
            (!capitalStateEndpointCall && !grantsEndpointCall) ||
            (!capitalState && !grantList) ||
            capitalStateQuery.isFetching ||
            grantsQuery.isFetching
        ) {
            return 'Loading';
        } else if (capitalState?.hasGrants || grantList?.length) {
            return 'GrantList';
        }
        return capitalState?.dynamicOffer ? 'PreQualified' : 'Unqualified';
    }, [capitalState, capitalStateEndpointCall, capitalStateQuery, grantList, grantsEndpointCall, grantsQuery, isRegionSupported]);

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
                                    {...getCapitalErrorMessage(capitalStateQuery.error as AdyenPlatformExperienceError, onContactSupport)}
                                />
                            </div>
                        );
                    case 'GrantList':
                        return (
                            grantList && (
                                <GrantList
                                    capitalState={capitalState}
                                    grantList={grantList}
                                    hideTitle={hideTitle}
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
                                capitalState={capitalState!}
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
