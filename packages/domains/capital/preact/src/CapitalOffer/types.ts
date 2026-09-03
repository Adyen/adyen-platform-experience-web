import { IGrantOfferResponseDTO, UIElementProps } from '@integration-components/types';
import { EnhancedCapitalState, OnFundsRequestCallback } from '@integration-components/capital/domain';

export interface CapitalOfferProps extends UIElementProps {
    externalCapitalState?: EnhancedCapitalState;
    onFundsRequest: OnFundsRequestCallback;
    onOfferDismiss?: () => void;
    onOfferSelect?: (data: IGrantOfferResponseDTO) => void;
}

export type CapitalOfferComponentProps = Omit<CapitalOfferProps, 'externalCapitalState'>;

export type CapitalOfferElementProps = CapitalOfferComponentProps;
