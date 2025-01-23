import { FunctionalComponent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOfferProps } from '../../types';
import { CAPITAL_OFFER_CLASS_NAMES } from './constants';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { CapitalOfferSelection } from '../CapitalOfferSelection/CapitalOfferSelection';
import { IDynamicOffersConfig, IGrantOfferResponseDTO } from '../../../../../types';
import { useConfigurationContext } from '../../../../../core/ConfigurationContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';
import { CapitalOfferSummary } from '../CapitalOfferSummary/CapitalOfferSummary';

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({
    externalDynamicOffersConfig,
    hideTitle,
    onContactSupport,
    onFundsRequest,
    onOfferDismiss,
    onOfferSelect,
}) => {
    const { getDynamicGrantOffersConfiguration } = useConfigurationContext().endpoints;

    const [emptyGrantOffer, setEmptyGrantOffer] = useState(false);
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

    return (
        <div className={CAPITAL_OFFER_CLASS_NAMES.base}>
            <CapitalHeader
                hasDivider
                hideTitle={hideTitle}
                titleKey={capitalOfferState === 'OfferSummary' ? 'capital.businessFinancingSummary' : 'capital.businessFinancingOffer'}
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
