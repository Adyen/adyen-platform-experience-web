import { IDynamicOfferConfig, IGrant, IGrantOfferResponseDTO } from '../../../types';

export type CapitalOfferProps = {
    externalDynamicOffersConfig?: IDynamicOfferConfig;
    onOfferSelect?: (data: IGrantOfferResponseDTO) => void;
    onFundsRequest?: (data: IGrant) => void;
    onOfferDismissed?: () => void;
};
