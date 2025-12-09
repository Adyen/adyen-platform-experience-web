import { FunctionalComponent } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { isCapitalRegionSupported } from '../../../../internal/CapitalHeader/helpers';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOfferProps } from '../../types';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import { CAPITAL_OFFER_CLASS_NAMES, sharedCapitalOfferAnalyticsEventProperties } from './constants';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { CapitalOfferSelection } from '../CapitalOfferSelection/CapitalOfferSelection';
import { IDynamicOffersConfig, IGrantOfferResponseDTO } from '../../../../../types';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';
import { CapitalOfferSummary } from '../CapitalOfferSummary/CapitalOfferSummary';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import useComponentTiming from '../../../../../hooks/useComponentTiming';
import './CapitalOffer.scss';

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Capital offer',
} as const;

const DynamicCapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({
    externalDynamicOffersConfig,
    hideTitle,
    onContactSupport,
    onFundsRequest,
    onOfferDismiss,
    onOfferSelect,
}) => {
    const [emptyGrantOffer, setEmptyGrantOffer] = useState(false);
    const [requestedAmount, setRequestedAmount] = useState<number>();
    const [selectedOffer, setSelectedOffer] = useState<IGrantOfferResponseDTO>();

    const { getDynamicGrantOffersConfiguration } = useConfigContext().endpoints;

    const onSuccess = useCallback((data: IDynamicOffersConfig | undefined) => {
        if (data) {
            setEmptyGrantOffer(false);
        } else setEmptyGrantOffer(true);
    }, []);

    const { data: internalDynamicOffersConfig, error: dynamicOffersConfigError } = useFetch({
        fetchOptions: {
            enabled: !externalDynamicOffersConfig && !!getDynamicGrantOffersConfiguration,
            onSuccess: onSuccess,
        },
        queryFn: useCallback(async () => {
            return getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT);
        }, [getDynamicGrantOffersConfiguration]),
    });

    const config = externalDynamicOffersConfig || internalDynamicOffersConfig;

    const onOfferSelectHandler = useCallback(
        (data: IGrantOfferResponseDTO) => {
            if (onOfferSelect) {
                onOfferSelect(data);
            } else {
                setRequestedAmount(data?.grantAmount.value);
                setSelectedOffer(data);
            }
        },
        [onOfferSelect]
    );

    const capitalOfferState = useMemo<CapitalOfferState>(() => {
        return selectedOffer ? 'OfferSummary' : 'OfferSelection';
    }, [selectedOffer]);

    const { duration } = useComponentTiming();
    const userEvents = useAnalyticsContext();
    const logPageEvent = useRef(true);

    useEffect(() => {
        if (logPageEvent.current) {
            // Log page event only when the component is mounted
            logPageEvent.current = false;

            userEvents.addEvent?.('Landed on page', {
                ...sharedAnalyticsEventProperties,
                label: 'Capital offer',
            });
        }
    }, [userEvents]);

    useEffect(() => {
        return () => {
            if (duration.current !== undefined) {
                userEvents.addEvent?.('Duration', {
                    ...sharedAnalyticsEventProperties,
                    duration: Math.floor(duration.current satisfies number),
                });
            }
        };
    }, [duration, userEvents]);

    return (
        <div className={CAPITAL_OFFER_CLASS_NAMES.base}>
            <CapitalHeader
                hasDivider
                hideTitle={hideTitle}
                titleKey={capitalOfferState === 'OfferSummary' ? 'capital.offer.summary.title' : 'capital.offer.selection.title'}
            />
            {capitalOfferState === 'OfferSelection' && (
                <CapitalOfferSelection
                    requestedAmount={requestedAmount}
                    dynamicOffersConfig={config}
                    dynamicOffersConfigError={dynamicOffersConfigError}
                    onOfferDismiss={onOfferDismiss}
                    onOfferSelect={onOfferSelectHandler}
                    emptyGrantOffer={emptyGrantOffer}
                    onContactSupport={onContactSupport}
                />
            )}
            {capitalOfferState === 'OfferSummary' && (
                <CapitalOfferSummary
                    grantOffer={selectedOffer!}
                    onBack={() => setSelectedOffer(undefined)}
                    onFundsRequest={onFundsRequest}
                    onContactSupport={onContactSupport}
                />
            )}
        </div>
    );
};

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = props => {
    const legalEntity = useConfigContext()?.extraConfig?.legalEntity;
    const isRegionSupported = useMemo(() => isCapitalRegionSupported(legalEntity), [legalEntity]);

    if (!isRegionSupported) {
        return (
            <div className={CAPITAL_OFFER_CLASS_NAMES.errorContainer}>
                <CapitalHeader hideTitle={props.hideTitle} titleKey={'capital.common.title'} />
                <CapitalErrorMessageDisplay unsupportedRegion />
            </div>
        );
    }

    return <DynamicCapitalOffer {...props} />;
};
