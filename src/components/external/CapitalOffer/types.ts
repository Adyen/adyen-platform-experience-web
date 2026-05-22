import { IDynamicOffersConfig, IGrant, IGrantOfferResponseDTO } from '../../../types';
import { UIElementProps } from '../../types';

export interface CapitalOfferProps extends UIElementProps {
    externalDynamicOffersConfig?: IDynamicOffersConfig;
    onFundsRequest: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferSelect?: (data: IGrantOfferResponseDTO) => void;
}

export type CapitalOfferComponentProps = Omit<CapitalOfferProps, 'externalDynamicOffersConfig'>;

export type CapitalOfferElementProps = CapitalOfferComponentProps;
