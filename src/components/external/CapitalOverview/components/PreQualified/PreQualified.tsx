import { IDynamicOfferConfig } from '../../../../../types';
import PreQualifiedIntro from '../PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type PreQualifiedProps = {
    hideTitle: boolean | undefined;
    dynamicOffer: Required<IDynamicOfferConfig>;
    skipPreQualifiedIntro?: boolean;
    onSeeOptions?: (goToNextStep: () => void) => void;
};

type PreQualifiedState = 'Intro' | 'CapitalOffer';

export const PreQualified = ({ hideTitle, dynamicOffer, skipPreQualifiedIntro, onSeeOptions }: PreQualifiedProps) => {
    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(!!skipPreQualifiedIntro);
    const goToCapitalOffer = useCallback(() => setCapitalOfferSelection(true), []);
    const onSeeOptionsHandler = useCallback(() => {
        onSeeOptions ? onSeeOptions(goToCapitalOffer) : goToCapitalOffer();
    }, [goToCapitalOffer, onSeeOptions]);

    const goBackToIntro = useCallback(() => {
        setCapitalOfferSelection(false);
    }, []);

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
                <CapitalOffer onOfferSigned={() => console.log('On offer signed callback')} onOfferDismissed={goBackToIntro} />
            ) : null}
        </>
    );
};
