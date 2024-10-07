import { IDynamicOfferConfig, IGrantOfferResponseDTO } from '../../../types';

export type CapitalOfferProps = {
    externalDynamicOffersConfig?: IDynamicOfferConfig;
    onOfferSigned: () => void;
    onOfferReviewed?: (data: IGrantOfferResponseDTO) => void;
    onOfferDismissed?: () => void;
};
