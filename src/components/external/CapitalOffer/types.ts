import { IDynamicOfferConfig, IGrant, IGrantOfferResponseDTO } from '../../../types';

export type CapitalOfferProps = {
    externalDynamicOffersConfig?: IDynamicOfferConfig;
    onFundsRequest: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferSelect?: (data: IGrantOfferResponseDTO) => void;
};

export type CapitalOfferElementProps = Omit<CapitalOfferProps, 'externalDynamicOffersConfig'>;
