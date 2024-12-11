import { FunctionalComponent } from 'preact';
import { GrantListProps } from './types';
import './GrantList.scss';
import { useCallback, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';
import { GrantsDisplay } from './GrantsDisplay';
import { IGrant } from '../../../../../types';

export const GrantList: FunctionalComponent<GrantListProps> = ({
    externalDynamicOffersConfig,
    grantList,
    newOfferAvailable,
    onFundsRequest,
    onOfferDismiss,
}) => {
    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(false);

    const goBackToPreviousStep = useCallback(() => setCapitalOfferSelection(false), []);
    const goToNextStep = useCallback(() => setCapitalOfferSelection(true), []);

    const goBackToList = useCallback(() => {
        onOfferDismiss ? onOfferDismiss(goBackToPreviousStep) : goBackToPreviousStep();
    }, [goBackToPreviousStep, onOfferDismiss]);

    const goBackToGrantListOnFundsRequest = useCallback(
        (data: IGrant) => {
            onFundsRequest(data);
            setCapitalOfferSelection(false);
        },
        [onFundsRequest]
    );

    return (
        <>
            {capitalOfferSelection ? (
                <CapitalOffer
                    externalDynamicOffersConfig={externalDynamicOffersConfig}
                    onFundsRequest={goBackToGrantListOnFundsRequest}
                    onOfferDismiss={goBackToList}
                />
            ) : (
                <GrantsDisplay grantList={grantList} newOfferAvailable={newOfferAvailable} onNewOfferRequest={goToNextStep} />
            )}
        </>
    );
};
