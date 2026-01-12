import { IDynamicOffersConfig, IGrant } from '../../../../../../types';
import PreQualifiedIntro from '../PreQualifiedIntro';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';

type PreQualifiedProps = {
    dynamicOffer: Required<IDynamicOffersConfig>;
    hideTitle: boolean | undefined;
    onFundsRequest: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
};

export const PreQualified = ({
    hideTitle,
    dynamicOffer,
    skipPreQualifiedIntro,
    onOfferOptionsRequest,
    onFundsRequest,
    onOfferDismiss,
}: PreQualifiedProps) => {
    const [state, setState] = useState<'intro' | 'capitalOffer'>(skipPreQualifiedIntro ? 'capitalOffer' : 'intro');

    const handleOfferOptionsRequest = useCallback(() => {
        onOfferOptionsRequest ? onOfferOptionsRequest() : setState('capitalOffer');
    }, [onOfferOptionsRequest]);

    const isOfferDismissButtonVisible = useMemo(() => !skipPreQualifiedIntro || !!onOfferDismiss, [onOfferDismiss, skipPreQualifiedIntro]);
    const handleOfferDismiss = useCallback(() => {
        onOfferDismiss ? onOfferDismiss() : setState('intro');
    }, [onOfferDismiss]);

    return (
        <>
            {state === 'intro' ? (
                <PreQualifiedIntro hideTitle={hideTitle} dynamicOfferConfig={dynamicOffer} onOfferOptionsRequest={handleOfferOptionsRequest} />
            ) : (
                <CapitalOffer
                    onFundsRequest={onFundsRequest}
                    onOfferDismiss={isOfferDismissButtonVisible ? handleOfferDismiss : undefined}
                    externalDynamicOffersConfig={dynamicOffer}
                />
            )}
        </>
    );
};
