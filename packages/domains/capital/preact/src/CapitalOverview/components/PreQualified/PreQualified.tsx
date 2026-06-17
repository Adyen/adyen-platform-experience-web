import { ICapitalState, IGrant } from '@integration-components/types';
import PreQualifiedIntro from '../PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type PreQualifiedProps = {
    capitalState: ICapitalState;
    hideTitle: boolean | undefined;
    onFundsRequest: (data: IGrant) => void;
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
