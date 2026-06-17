import { FunctionalComponent } from 'preact';
import './GrantList.scss';
import { useCallback, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';
import { GrantsDisplay } from './GrantsDisplay';
import { ICapitalState, IGrant } from '@integration-components/types';

export interface GrantListProps {
    capitalState?: ICapitalState;
    grantList: IGrant[];
    hideTitle?: boolean;
    onFundsRequest?: (data: IGrant) => void;
    onGrantListUpdateRequest: (data: IGrant) => void;
    onOfferDismiss?: (goToPreviousStep: () => void) => void;
}

export const GrantList: FunctionalComponent<GrantListProps> = ({
    capitalState,
    grantList,
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

    const handleFundsRequest = useCallback(
        (data: IGrant) => {
            if (onFundsRequest) {
                onFundsRequest(data);
            } else {
                onGrantListUpdateRequest(data);
                setIsCapitalOfferVisible(false);
            }
        },
        [onFundsRequest, onGrantListUpdateRequest]
    );

    return (
        <>
            {isCapitalOfferVisible ? (
                <CapitalOffer externalCapitalState={capitalState} onFundsRequest={handleFundsRequest} onOfferDismiss={goBackToList} />
            ) : (
                <GrantsDisplay
                    grantList={grantList}
                    newOfferAvailable={!!capitalState?.dynamicOffer && !capitalState?.renewableGrants.length}
                    onNewOfferRequest={goToNextStep}
                />
            )}
        </>
    );
};
