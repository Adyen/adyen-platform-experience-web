import { FunctionalComponent } from 'preact';
import './GrantList.scss';
import { useCallback, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';
import { GrantsDisplay } from './GrantsDisplay';
import { IGrant } from '@integration-components/types';
import { EnhancedCapitalState, OnFundsRequestCallback } from '@integration-components/capital/domain';

interface GrantListProps {
    capitalState: EnhancedCapitalState;
    grants: IGrant[];
    hideTitle?: boolean;
    onFundsRequest?: OnFundsRequestCallback;
    onGrantListUpdateRequest: (data: IGrant) => void;
    onOfferDismiss?: (goToPreviousStep: () => void) => void;
}

export const GrantList: FunctionalComponent<GrantListProps> = ({
    capitalState,
    grants,
    hideTitle,
    onFundsRequest,
    onGrantListUpdateRequest,
    onOfferDismiss,
}) => {
    const [isCapitalOfferVisible, setIsCapitalOfferVisible] = useState<boolean>(false);

    const goBackToPreviousStep = useCallback(() => setIsCapitalOfferVisible(false), []);
    const goToNextStep = useCallback(() => setIsCapitalOfferVisible(true), []);

    const goBackToList = useCallback(() => {
        if (onOfferDismiss) {
            onOfferDismiss(goBackToPreviousStep);
        } else {
            goBackToPreviousStep();
        }
    }, [goBackToPreviousStep, onOfferDismiss]);

    const handleFundsRequest = useCallback<OnFundsRequestCallback>(
        (data, renewsGrantId) => {
            if (onFundsRequest) {
                onFundsRequest(data, renewsGrantId);
            } else {
                onGrantListUpdateRequest({ ...data, renewsGrantId });
                setIsCapitalOfferVisible(false);
            }
        },
        [onFundsRequest, onGrantListUpdateRequest]
    );

    return (
        <>
            {isCapitalOfferVisible ? (
                <CapitalOffer
                    externalCapitalState={capitalState}
                    hideTitle={hideTitle}
                    onFundsRequest={handleFundsRequest}
                    onOfferDismiss={goBackToList}
                />
            ) : (
                <GrantsDisplay grants={grants} hideTitle={hideTitle} capitalState={capitalState} onNewOfferRequest={goToNextStep} />
            )}
        </>
    );
};
