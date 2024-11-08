import { IDynamicOfferConfig, IGrant } from '../../../../../types';

export interface GrantListProps {
    grantList: IGrant[];
    hideTitle?: boolean;
    newOfferAvailable: boolean;
    onRequestFundsHandler: (data: IGrant) => void;
    onOfferDismissed?: (goToPreviousStep: () => void) => void;
    externalDynamicOffersConfig?: IDynamicOfferConfig;
}

export interface GrantsProps {
    grantList: IGrant[];
    hideTitle?: boolean;
    newOfferAvailable: boolean;
    onNewOfferRequest: () => void;
}
