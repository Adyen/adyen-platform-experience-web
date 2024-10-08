import { IDynamicOfferConfig, IGrant } from '../../../types';

export type CapitalOfferProps = {
    externalDynamicOffersConfig?: IDynamicOfferConfig;
    onRequestFunds: (data: IGrant) => void;
    onOfferDismissed?: () => void;
};
