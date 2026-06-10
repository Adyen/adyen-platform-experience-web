import { ICapitalState, IGrant, IGrantOfferResponseDTO, UIElementProps } from '@integration-components/types';

export interface CapitalOfferProps extends UIElementProps {
    externalCapitalState?: ICapitalState;
    onFundsRequest: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferSelect?: (data: IGrantOfferResponseDTO) => void;
}

export type CapitalOfferComponentProps = Omit<CapitalOfferProps, 'externalCapitalState'>;

export type CapitalOfferElementProps = CapitalOfferComponentProps;
