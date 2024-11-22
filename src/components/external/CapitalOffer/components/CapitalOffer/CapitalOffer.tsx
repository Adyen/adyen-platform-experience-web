import { FunctionalComponent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOfferProps } from '../../types';
import { CAPITAL_OFFER_CLASS_NAMES } from './constants';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { CapitalOfferSelection } from '../CapitalOfferSelection/CapitalOfferSelection';
import { IDynamicOfferConfig, IGrantOfferResponseDTO } from '../../../../../types';
import { useAuthContext } from '../../../../../core/Auth';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';
import { CapitalOfferSummary } from '../CapitalOfferSummary/CapitalOfferSummary';

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';
const REPAYMENT_FREQUENCY = 30;

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({
    externalDynamicOffersConfig,
    hideTitle,
    onContactSupport,
    onFundsRequest,
    onOfferDismiss,
    onOfferSelect,
}) => {
    const { getDynamicGrantOffersConfiguration } = useAuthContext().endpoints;

    const [emptyGrantOffer, setEmptyGrantOffer] = useState(false);
    const onSuccess = useCallback((data: IDynamicOfferConfig | undefined) => {
        if (data) {
            setEmptyGrantOffer(false);
        } else setEmptyGrantOffer(true);
    }, []);

    const { data: internalDynamicOffersConfig } = useFetch({
        fetchOptions: {
            enabled: !externalDynamicOffersConfig && !!getDynamicGrantOffersConfiguration,
            onSuccess: onSuccess,
        },
        queryFn: useCallback(async () => {
            return getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT);
        }, [getDynamicGrantOffersConfiguration]),
    });

    const config = externalDynamicOffersConfig || internalDynamicOffersConfig;

    const goBackHandler = useCallback(() => {
        onOfferDismiss?.();
    }, [onOfferDismiss]);

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
                    config={config}
                    onBack={goBackHandler}
                    onOfferSelect={onOfferSelectHandler}
                    repaymentFrequency={REPAYMENT_FREQUENCY}
                    emptyGrantOffer={emptyGrantOffer}
                    onContactSupport={onContactSupport}
                />
            )}
            {capitalOfferState === 'OfferSummary' && (
                <CapitalOfferSummary
                    grantOffer={selectedOffer!}
                    repaymentFrequency={REPAYMENT_FREQUENCY}
                    onBack={() => setSelectedOffer(undefined)}
                    onFundsRequest={onFundsRequest}
                    onContactSupport={onContactSupport}
                />
            )}
        </div>
    );
};
