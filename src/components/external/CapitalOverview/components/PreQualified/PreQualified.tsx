import { IDynamicOfferConfig, IGrant } from '../../../../../types';
import PreQualifiedIntro from '../PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type PreQualifiedProps = {
    hideTitle: boolean | undefined;
    dynamicOffer: Required<IDynamicOfferConfig>;
    skipPreQualifiedIntro?: boolean;
    onRequestFundsHandler?: (data: IGrant) => void;
    onSeeOptions?: (goToNextStep: () => void) => void;
    onOfferDismissed?: (goToPreviousStep: () => void) => void;
};

type PreQualifiedState = 'Intro' | 'CapitalOffer';

export const PreQualified = ({
    hideTitle,
    dynamicOffer,
    skipPreQualifiedIntro,
    onSeeOptions,
    onRequestFundsHandler,
    onOfferDismissed,
}: PreQualifiedProps) => {
    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(!!skipPreQualifiedIntro);
    const goToCapitalOffer = useCallback(() => setCapitalOfferSelection(true), []);
    const onSeeOptionsHandler = useCallback(() => {
        onSeeOptions ? onSeeOptions(goToCapitalOffer) : goToCapitalOffer();
    }, [goToCapitalOffer, onSeeOptions]);

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
                <CapitalOffer onFundsRequest={onRequestFundsHandler} onOfferDismissed={goBackToIntro} />
            ) : null}
        </>
    );
};
