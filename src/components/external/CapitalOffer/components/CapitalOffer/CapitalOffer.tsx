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
    dynamicOffersConfig,
    onOfferReviewed,
    onBack,
}) => {
    const { getDynamicGrantOffersConfiguration } = useAuthContext().endpoints;
    const { data: grantOfferConfig } = useFetch({
        fetchOptions: { enabled: !dynamicOffersConfig },
        queryFn: useCallback(async () => {
            return getDynamicGrantOffersConfiguration?.(EMPTY_OBJECT);
        }, [getDynamicGrantOffersConfiguration]),
    });

    const config = dynamicOffersConfig || grantOfferConfig;

    const goBackToPreviousStep = useCallback(() => {
        //TODO implement going back to previous step
        console.log('goBack');
    }, []);

    const goBackHandler = useCallback(() => {
        onBack ? onBack() : goBackToPreviousStep();
    }, [goBackToPreviousStep, onBack]);

    const [selectedOffer, setSelectedOffer] = useState<IGrantOfferResponseDTO>();
    const onOfferSelectionHandler = useCallback(
        (data: IGrantOfferResponseDTO) => {
            onOfferReviewed ? onOfferReviewed(data) : setSelectedOffer(data);
        },
        [onOfferReviewed]
    );

    const CapitalOfferState = useMemo<CapitalOfferState>(() => {
        if (selectedOffer) {
            return 'OfferSummary';
        }
        return 'OfferSelection';
    }, [selectedOffer]);

    return (
        <div className={CAPITAL_OFFER_CLASS_NAMES.base}>
            <CapitalHeader
                hideTitle={hideTitle}
                titleKey={CapitalOfferState === 'OfferSummary' ? 'capital.businessFinancingSummary' : 'capital.businessFinancing'}
            />
            {CapitalOfferState === 'OfferSelection' && (
                <CapitalOfferSelection config={config} onBack={goBackHandler} onReviewOffer={onOfferSelectionHandler} />
            )}
            {CapitalOfferState === 'OfferSummary' && <p>{'Placeholder for OfferSummary component'}</p>}
        </div>
    );
};
