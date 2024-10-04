import { IDynamicOfferConfig, IGrantOfferResponseDTO } from '../../../types';

export type CapitalOfferProps = {
    dynamicOffersConfig?: IDynamicOfferConfig;
    onOfferSigned: () => void;
    onOfferReviewed?: (data: IGrantOfferResponseDTO) => void;
    onBack?: () => void;
};
