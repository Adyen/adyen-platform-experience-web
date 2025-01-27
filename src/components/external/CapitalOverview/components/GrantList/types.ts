import { IDynamicOffersConfig, IGrant } from '../../../../../types';
import { GrantAccountTypes } from './constants';

export type GrantAccountType = keyof typeof GrantAccountTypes;
export type GrantAccountDisplayCallback = (grant: IGrant, accountType?: GrantAccountType) => void;

export interface GrantAccountDisplayProps {
    accountType: GrantAccountType;
    grant: IGrant;
    onDisplayClose: () => void;
}

export interface GrantListProps {
    externalDynamicOffersConfig?: IDynamicOffersConfig;
    grantList: IGrant[];
    hideTitle?: boolean;
    newOfferAvailable: boolean;
    onFundsRequest: (data: IGrant) => void;
    onOfferDismiss?: (goToPreviousStep: () => void) => void;
}

export interface GrantsProps {
    grantList: IGrant[];
    hideTitle?: boolean;
    newOfferAvailable: boolean;
    onNewOfferRequest: () => void;
}
