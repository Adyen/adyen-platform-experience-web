import { IDynamicOfferConfig, IGrant } from '../../../../../types';
import PreQualifiedIntro from '../PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type PreQualifiedProps = {
    hideTitle: boolean | undefined;
    dynamicOffer: Required<IDynamicOfferConfig>;
    skipPreQualifiedIntro?: boolean;
    onRequestFundsHandler: (data: IGrant) => void;
};

type PreQualifiedState = 'Intro' | 'CapitalOffer';

export const PreQualified = ({ hideTitle, dynamicOffer, skipPreQualifiedIntro, onRequestFundsHandler }: PreQualifiedProps) => {
    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(!!skipPreQualifiedIntro);
    const onReviewOfferOptionsHandler = useCallback(() => {
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
                <PreQualifiedIntro hideTitle={hideTitle} dynamicOffer={dynamicOffer} onReviewOfferOptions={onReviewOfferOptionsHandler} />
            ) : state === 'CapitalOffer' ? (
                <CapitalOffer onRequestFunds={onRequestFundsHandler} onOfferDismissed={goBackToPrequalified} />
            ) : null}
        </>
    );
};
