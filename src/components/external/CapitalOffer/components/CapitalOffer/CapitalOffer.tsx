import { FunctionalComponent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { isCapitalRegionSupported } from '../../../../internal/CapitalHeader/helpers';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOfferProps } from '../../types';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import { CAPITAL_OFFER_CLASS_NAMES } from './constants';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { CapitalOfferSelection } from '../CapitalOfferSelection/CapitalOfferSelection';
import { IDynamicOffersConfig, IGrantOfferResponseDTO } from '../../../../../types';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';
import { CapitalOfferSummary } from '../CapitalOfferSummary/CapitalOfferSummary';
import './CapitalOffer.scss';

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({
    externalDynamicOffersConfig,
    hideTitle,
    onContactSupport,
    onFundsRequest,
    onOfferDismiss,
    onOfferSelect,
}) => {
    const { getDynamicGrantOffersConfiguration } = useConfigContext().endpoints;
    const legalEntity = useConfigContext()?.extraConfig?.legalEntity;

    const isRegionSupported = useMemo(() => isCapitalRegionSupported(legalEntity), [legalEntity]);

    const [emptyGrantOffer, setEmptyGrantOffer] = useState(false);
    const onSuccess = useCallback((data: IDynamicOffersConfig | undefined) => {
        if (data) {
            setEmptyGrantOffer(false);
        } else setEmptyGrantOffer(true);
    }, []);

    const { data: internalDynamicOffersConfig, error: dynamicOffersConfigError } = useFetch({
        fetchOptions: {
            enabled: !externalDynamicOffersConfig && !!getDynamicGrantOffersConfiguration && isRegionSupported,
            onSuccess: onSuccess,
        },
        queryFn: useCallback(async () => {
            return getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT);
        }, [getDynamicGrantOffersConfiguration]),
    });

    const config = externalDynamicOffersConfig || internalDynamicOffersConfig;

    const [selectedOffer, setSelectedOffer] = useState<IGrantOfferResponseDTO>();

    const [requestedAmount, setRequestedAmount] = useState<number>();

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
        if (selectedOffer) {
            return 'OfferSummary';
        }
        return 'OfferSelection';
    }, [selectedOffer]);

    if (!isRegionSupported) {
        return (
            <div className={CAPITAL_OFFER_CLASS_NAMES.errorContainer}>
                <CapitalHeader hideTitle={hideTitle} titleKey={'capital.common.title'} />
                <CapitalErrorMessageDisplay unsupportedRegion />
            </div>
        );
    }

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
