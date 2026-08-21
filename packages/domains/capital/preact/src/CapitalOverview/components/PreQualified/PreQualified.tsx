import PreQualifiedIntro from '../PreQualifiedIntro/PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';
import { EnhancedCapitalState } from '../../../utils/capital/getCapitalState';
import { OnFundsRequestCallback } from '../../../types';
import { CapitalHeader } from '../../../internal/CapitalHeader';

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
    const [state, setState] = useState<'noOffer' | 'intro' | 'offer'>(
        !capitalState.dynamicOffer ? 'noOffer' : skipPreQualifiedIntro ? 'offer' : 'intro'
    );

    const handleOfferOptionsRequest = useCallback(() => {
        if (onOfferOptionsRequest) {
            onOfferOptionsRequest();
        } else {
            setState('offer');
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
            {state === 'noOffer' && (
                <div>
                    <CapitalHeader hideTitle={hideTitle} titleKey={'capital.overview.common.titles.qualificationIntro'} />
                    <CapitalOffer hideTitle onFundsRequest={onFundsRequest} externalCapitalState={capitalState} />
                </div>
            )}
            {state === 'intro' && capitalState.dynamicOffer?.maxAmount && (
                <PreQualifiedIntro
                    hideTitle={hideTitle}
                    maxAmount={capitalState.dynamicOffer.maxAmount}
                    onOfferOptionsRequest={handleOfferOptionsRequest}
                    region={capitalState.region}
                />
            )}
            {state === 'offer' && (
                <CapitalOffer
                    hideTitle={hideTitle}
                    onFundsRequest={onFundsRequest}
                    onOfferDismiss={isOfferDismissButtonVisible ? handleOfferDismiss : undefined}
                    externalCapitalState={capitalState}
                />
            )}
        </>
    );
};
