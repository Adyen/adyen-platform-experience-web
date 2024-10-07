import { IDynamicOfferConfig, IGrant, IGrantOfferResponseDTO } from '../../../types';

export type CapitalOfferProps = {
    externalDynamicOffersConfig?: IDynamicOfferConfig;
    onOfferSigned: (data: IGrant) => void;
    onOfferReviewed?: (data: IGrantOfferResponseDTO) => void;
    onOfferDismissed?: () => void;
};
