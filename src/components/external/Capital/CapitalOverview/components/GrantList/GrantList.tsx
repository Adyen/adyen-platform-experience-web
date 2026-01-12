import { FunctionalComponent } from 'preact';
import { GrantListProps } from './types';
import './GrantList.scss';
import { useCallback, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';
import { GrantsDisplay } from './GrantsDisplay';
import { IGrant } from '../../../../../../types';

export const GrantList: FunctionalComponent<GrantListProps> = ({
    externalDynamicOffersConfig,
    grantList,
    newOfferAvailable,
    onFundsRequest,
    onGrantListUpdateRequest,
    onOfferDismiss,
}) => {
    const [isCapitalOfferVisible, setIsCapitalOfferVisible] = useState<boolean>(false);

    const goBackToPreviousStep = useCallback(() => setIsCapitalOfferVisible(false), []);
    const goToNextStep = useCallback(() => setIsCapitalOfferVisible(true), []);

    const goBackToList = useCallback(() => {
        onOfferDismiss ? onOfferDismiss(goBackToPreviousStep) : goBackToPreviousStep();
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
                <CapitalOffer
                    externalDynamicOffersConfig={externalDynamicOffersConfig}
                    onFundsRequest={handleFundsRequest}
                    onOfferDismiss={goBackToList}
                />
            ) : (
                <GrantsDisplay grantList={grantList} newOfferAvailable={newOfferAvailable} onNewOfferRequest={goToNextStep} />
            )}
        </>
    );
};
