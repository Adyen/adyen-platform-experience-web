import { IDynamicOffersConfig, IGrant } from '../../../../../../types';

export interface GrantListProps {
    externalDynamicOffersConfig?: IDynamicOffersConfig;
    grantList: IGrant[];
    hideTitle?: boolean;
    newOfferAvailable: boolean;
    onFundsRequest?: (data: IGrant) => void;
    onGrantListUpdateRequest: (data: IGrant) => void;
    onOfferDismiss?: (goToPreviousStep: () => void) => void;
}

export interface GrantsProps {
    grantList: IGrant[];
    hideTitle?: boolean;
    newOfferAvailable: boolean;
    onNewOfferRequest: () => void;
}
