import { IDynamicOfferConfig, IGrant, IGrantOfferResponseDTO } from '../../../types';

export type CapitalOfferProps = {
    dynamicOffersConfig?: IDynamicOfferConfig;
    onOfferSigned: (data: IGrant) => void;
    onOfferReviewed?: (data: IGrantOfferResponseDTO) => void;
    onBack?: () => void;
};
