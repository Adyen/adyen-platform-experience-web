import { IDynamicOfferConfig } from '../../../types';

export type CapitalOfferProps = {
    dynamicOffersConfig?: IDynamicOfferConfig;
    onOfferSigned: () => void;
};
