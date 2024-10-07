import { FunctionalComponent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOfferProps } from '../../types';
import { CAPITAL_OFFER_CLASS_NAMES } from './constants';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { CapitalOfferSelection } from '../CapitalOfferSelection/CapitalOfferSelection';
import { IGrantOfferResponseDTO } from '../../../../../types';
import { useAuthContext } from '../../../../../core/Auth';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';
import { CapitalOfferSummary } from '../CapitalOfferSummary/CapitalOfferSummary';

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';
const REPAYMENT_FREQUENCY = 30;

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({
    hideTitle,
    externalDynamicOffersConfig,
    onOfferReviewed,
    onOfferDismissed,
    onOfferSigned,
}) => {
    const { getDynamicGrantOffersConfiguration } = useAuthContext().endpoints;
    const { data: internalDynamicOffersConfig } = useFetch({
        fetchOptions: { enabled: !externalDynamicOffersConfig },
        queryFn: useCallback(async () => {
            return getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT);
        }, [getDynamicGrantOffersConfiguration]),
    });

    const config = externalDynamicOffersConfig || internalDynamicOffersConfig;

    const goBackToPreviousStep = useCallback(() => {
        //TODO implement going back to previous step
        console.log('goBack');
    }, []);

    const goBackHandler = useCallback(() => {
        onOfferDismissed ? onOfferDismissed() : goBackToPreviousStep();
    }, [goBackToPreviousStep, onOfferDismissed]);

    const [selectedOffer, setSelectedOffer] = useState<IGrantOfferResponseDTO>();
    const [requestedAmount, setRequestedAmount] = useState<number>();

    const onReviewOfferHandler = useCallback(
        (data: IGrantOfferResponseDTO) => {
            setRequestedAmount(data.grantAmount.value);
            if (onOfferReviewed) {
                onOfferReviewed(data);
            } else {
                setSelectedOffer(prev => (prev ? { ...prev, id: data.id } : prev));
            }
        },
        [onOfferReviewed]
    );

    const onOfferSelection = useCallback((data: IGrantOfferResponseDTO) => {
        setSelectedOffer(data);
    }, []);

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
                titleKey={capitalOfferState === 'OfferSummary' ? 'capital.businessFinancingSummary' : 'capital.businessFinancing'}
            />
            {capitalOfferState === 'OfferSelection' && (
                <CapitalOfferSelection
                    requestedAmount={requestedAmount}
                    config={config}
                    onBack={goBackHandler}
                    onOfferSelection={onOfferSelection}
                    onReviewOffer={onReviewOfferHandler}
                    repaymentFrequency={REPAYMENT_FREQUENCY}
                />
            )}
            {capitalOfferState === 'OfferSummary' && (
                <CapitalOfferSummary
                    grantOffer={selectedOffer!}
                    repaymentFrequency={REPAYMENT_FREQUENCY}
                    onBack={() => setSelectedOffer(undefined)}
                    onOfferSigned={onOfferSigned}
                />
            )}
        </div>
    );
};
