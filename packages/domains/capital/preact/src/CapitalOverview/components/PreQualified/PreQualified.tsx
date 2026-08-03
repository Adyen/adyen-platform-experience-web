import PreQualifiedIntro from '../PreQualifiedIntro/PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';
import { EnhancedCapitalState } from '../../../utils/capital/getCapitalState';
import { OnFundsRequestCallback } from '../../../types';

type PreQualifiedProps = {
    capitalState: EnhancedCapitalState;
    hideTitle: boolean | undefined;
    onFundsRequest: OnFundsRequestCallback;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
};

export const PreQualified = ({
    capitalState,
    hideTitle,
    skipPreQualifiedIntro,
    onOfferOptionsRequest,
    onFundsRequest,
    onOfferDismiss,
}: PreQualifiedProps) => {
    const [state, setState] = useState<'intro' | 'capitalOffer'>(skipPreQualifiedIntro ? 'capitalOffer' : 'intro');

    const handleOfferOptionsRequest = useCallback(() => {
        if (onOfferOptionsRequest) {
            onOfferOptionsRequest();
        } else {
            setState('capitalOffer');
        }
    }, [onOfferOptionsRequest]);

    const isOfferDismissButtonVisible = useMemo(() => !skipPreQualifiedIntro || !!onOfferDismiss, [onOfferDismiss, skipPreQualifiedIntro]);
    const handleOfferDismiss = useCallback(() => {
        if (onOfferDismiss) {
            onOfferDismiss();
        } else {
            setState('intro');
        }
    }, [onOfferDismiss]);

    return (
        <>
            {state === 'intro' && capitalState.dynamicOffer?.maxAmount ? (
                <PreQualifiedIntro
                    hideTitle={hideTitle}
                    maxAmount={capitalState.dynamicOffer.maxAmount}
                    onOfferOptionsRequest={handleOfferOptionsRequest}
                />
            ) : (
                <CapitalOffer
                    onFundsRequest={onFundsRequest}
                    onOfferDismiss={isOfferDismissButtonVisible ? handleOfferDismiss : undefined}
                    externalCapitalState={capitalState}
                />
            )}
        </>
    );
};
