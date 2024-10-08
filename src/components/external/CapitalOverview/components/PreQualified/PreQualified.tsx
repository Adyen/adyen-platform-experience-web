import { IDynamicOfferConfig } from '../../../../../types';
import PreQualifiedIntro from '../PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type PreQualifiedProps = {
    hideTitle: boolean | undefined;
    dynamicOffer: Required<IDynamicOfferConfig>;
    skipPreQualifiedIntro?: boolean;
};

type PreQualifiedState = 'Intro' | 'CapitalOffer';

export const PreQualified = ({ hideTitle, dynamicOffer, skipPreQualifiedIntro }: PreQualifiedProps) => {
    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(!!skipPreQualifiedIntro);
    const onOfferReviewHandler = useCallback(() => {
        setCapitalOfferSelection(true);
    }, []);

    const goBackToPrequalified = useCallback(() => {
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
                <PreQualifiedIntro hideTitle={hideTitle} dynamicOffer={dynamicOffer} onOfferReview={onOfferReviewHandler} />
            ) : state === 'CapitalOffer' ? (
                <CapitalOffer onOfferSigned={() => console.log('On offer signed callback')} onOfferDismissed={goBackToPrequalified} />
            ) : null}
        </>
    );
};
