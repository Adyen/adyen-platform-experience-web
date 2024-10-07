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

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({
    hideTitle,
    externalDynamicOffersConfig,
    onOfferReviewed,
    onOfferDismissed,
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
    const onOfferSelectionHandler = useCallback(
        (data: IGrantOfferResponseDTO) => {
            onOfferReviewed ? onOfferReviewed(data) : setSelectedOffer(data);
        },
        [onOfferReviewed]
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
                hideTitle={hideTitle}
                titleKey={capitalOfferState === 'OfferSummary' ? 'capital.businessFinancingSummary' : 'capital.businessFinancing'}
            />
            {capitalOfferState === 'OfferSelection' && <CapitalOfferSelection config={config} onBack={goBackHandler} />}
            {capitalOfferState === 'OfferSummary' && <p>{'Placeholder for OfferSummary component'}</p>}
        </div>
    );
};
