import { IGrant, IGrantOfferResponseDTO, UIElementProps } from '@integration-components/types';
import { EnhancedCapitalState } from '../utils/capital/getCapitalState';

export interface CapitalOfferProps extends UIElementProps {
    externalCapitalState?: EnhancedCapitalState;
    onFundsRequest: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferSelect?: (data: IGrantOfferResponseDTO) => void;
}

export type CapitalOfferComponentProps = Omit<CapitalOfferProps, 'externalCapitalState'>;

export type CapitalOfferElementProps = CapitalOfferComponentProps;
