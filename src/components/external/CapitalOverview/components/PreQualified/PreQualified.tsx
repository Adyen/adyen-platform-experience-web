import { IDynamicOfferConfig, IGrant } from '../../../../../types';
import PreQualifiedIntro from '../PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type PreQualifiedProps = {
    dynamicOffer: Required<IDynamicOfferConfig>;
    hideTitle: boolean | undefined;
    onFundsRequest: (data: IGrant) => void;
    onOfferDismiss?: (goToPreviousStep: () => void) => void;
    onOfferOptionsRequest?: (goToNextStep: () => void) => void;
    skipPreQualifiedIntro?: boolean;
};

type PreQualifiedState = 'Intro' | 'CapitalOffer';

export const PreQualified = ({
    hideTitle,
    dynamicOffer,
    skipPreQualifiedIntro,
    onOfferOptionsRequest,
    onFundsRequest,
    onOfferDismiss,
}: PreQualifiedProps) => {
    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(!!skipPreQualifiedIntro);
    const goToCapitalOffer = useCallback(() => setCapitalOfferSelection(true), []);
    const onSeeOptionsHandler = useCallback(() => {
        onOfferOptionsRequest ? onOfferOptionsRequest(goToCapitalOffer) : goToCapitalOffer();
    }, [goToCapitalOffer, onOfferOptionsRequest]);

    const goBackToPreviousStep = useCallback(() => setCapitalOfferSelection(false), []);
    const goBackToIntro = useCallback(() => {
        onOfferDismiss ? onOfferDismiss(goBackToPreviousStep) : goBackToPreviousStep();
    }, [goBackToPreviousStep, onOfferDismiss]);

    const state: PreQualifiedState = useMemo(() => {
        if (skipPreQualifiedIntro || capitalOfferSelection) {
            return 'CapitalOffer';
        }
        return 'Intro';
    }, [capitalOfferSelection, skipPreQualifiedIntro]);

    return (
        <>
            {state === 'Intro' ? (
                <PreQualifiedIntro hideTitle={hideTitle} dynamicOffer={dynamicOffer} onSeeOptions={onSeeOptionsHandler} />
            ) : state === 'CapitalOffer' ? (
                <CapitalOffer onFundsRequest={onFundsRequest} onOfferDismiss={goBackToIntro} externalDynamicOffersConfig={dynamicOffer} />
            ) : null}
        </>
    );
};
