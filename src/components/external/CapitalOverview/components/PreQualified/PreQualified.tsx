import { IDynamicOfferConfig, IGrant } from '../../../../../types';
import PreQualifiedIntro from '../PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type PreQualifiedProps = {
    hideTitle: boolean | undefined;
    dynamicOffer: Required<IDynamicOfferConfig>;
    skipPreQualifiedIntro?: boolean;
    onFundsRequestHandler?: (data: IGrant) => void;
    onOfferOptionsRequest?: (goToNextStep: () => void) => void;
    onOfferDismissed?: (goToPreviousStep: () => void) => void;
};

type PreQualifiedState = 'Intro' | 'CapitalOffer';

export const PreQualified = ({
    hideTitle,
    dynamicOffer,
    skipPreQualifiedIntro,
    onOfferOptionsRequest,
    onFundsRequestHandler,
    onOfferDismissed,
}: PreQualifiedProps) => {
    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(!!skipPreQualifiedIntro);
    const goToCapitalOffer = useCallback(() => setCapitalOfferSelection(true), []);
    const onSeeOptionsHandler = useCallback(() => {
        onOfferOptionsRequest ? onOfferOptionsRequest(goToCapitalOffer) : goToCapitalOffer();
    }, [goToCapitalOffer, onOfferOptionsRequest]);

    const goBackToPreviousStep = useCallback(() => setCapitalOfferSelection(false), []);
    const goBackToIntro = useCallback(() => {
        onOfferDismissed ? onOfferDismissed(goBackToPreviousStep) : goBackToPreviousStep();
    }, [goBackToPreviousStep, onOfferDismissed]);

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
                <CapitalOffer onFundsRequest={onFundsRequestHandler} onOfferDismissed={goBackToIntro} />
            ) : null}
        </>
    );
};
