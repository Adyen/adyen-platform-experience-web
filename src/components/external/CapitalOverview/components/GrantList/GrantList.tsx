import { FunctionalComponent } from 'preact';
import { GrantListProps } from './types';
import './GrantList.scss';
import { useCallback, useState } from 'preact/hooks';
import { CapitalOffer } from '../../../CapitalOffer/components/CapitalOffer/CapitalOffer';
import { GrantsDisplay } from './GrantsDisplay';

export const GrantList: FunctionalComponent<GrantListProps> = ({
    onFundsRequestHandler,
    onOfferDismissed,
    grantList,
    newOfferAvailable,
    externalDynamicOffersConfig,
}) => {
    const [capitalOfferSelection, setCapitalOfferSelection] = useState<boolean>(false);

    const goBackToPreviousStep = useCallback(() => setCapitalOfferSelection(false), []);
    const goToNextStep = useCallback(() => setCapitalOfferSelection(true), []);

    const goBackToList = useCallback(() => {
        onOfferDismissed ? onOfferDismissed(goBackToPreviousStep) : goBackToPreviousStep();
    }, [goBackToPreviousStep, onOfferDismissed]);

    return (
        <>
            {capitalOfferSelection ? (
                <CapitalOffer
                    externalDynamicOffersConfig={externalDynamicOffersConfig}
                    onFundsRequest={onFundsRequestHandler}
                    onOfferDismissed={goBackToList}
                />
            ) : (
                <GrantsDisplay grantList={grantList} newOfferAvailable={newOfferAvailable} onNewOfferRequest={goToNextStep} />
            )}
        </>
    );
};
