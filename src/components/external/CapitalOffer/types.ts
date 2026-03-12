import { IDynamicOffersConfig, IGrant, IGrantOfferResponseDTO } from '../../../types';
import { UIElementProps } from '../../types';

/**
 * Props for the CapitalOffer component
 */
export interface CapitalOfferProps extends UIElementProps {
    /** External dynamic offers configuration */
    externalDynamicOffersConfig?: IDynamicOffersConfig;
    /** Callback fired when user requests funds (required) */
    onFundsRequest: (data: IGrant) => void;
    /** Callback fired when user dismisses an offer */
    onOfferDismiss?: () => void;
    /** Callback fired when user selects an offer */
    onOfferSelect?: (data: IGrantOfferResponseDTO) => void;
}

/**
 * Props exposed by the CapitalOfferElement (externalDynamicOffersConfig is handled internally)
 */
export type CapitalOfferComponentProps = Omit<CapitalOfferProps, 'externalDynamicOffersConfig'>;

/**
 * @deprecated Use CapitalOfferComponentProps instead
 */
export type CapitalOfferElementProps = CapitalOfferComponentProps;
