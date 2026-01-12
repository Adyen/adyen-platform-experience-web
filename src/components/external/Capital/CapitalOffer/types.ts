import { IDynamicOffersConfig, IGrant, IGrantOfferResponseDTO } from '../../../../types';

export type CapitalOfferProps = {
    externalDynamicOffersConfig?: IDynamicOffersConfig;
    onFundsRequest: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferSelect?: (data: IGrantOfferResponseDTO) => void;
};

export type CapitalOfferElementProps = Omit<CapitalOfferProps, 'externalDynamicOffersConfig'>;
