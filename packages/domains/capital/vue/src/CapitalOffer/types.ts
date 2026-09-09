import type { CoreInstance } from '@integration-components/core/vue';
import type { EnhancedCapitalState, OnFundsRequestCallback } from '@integration-components/capital/domain';
import type { IGrantOfferResponseDTO, UIElementProps } from '@integration-components/types';

export interface CapitalOfferExternalProps extends Omit<UIElementProps, 'ref'> {
    core: CoreInstance;
    onFundsRequest: OnFundsRequestCallback;
    onOfferDismiss?: () => void;
    onOfferSelect?: (data: IGrantOfferResponseDTO) => void;
}

export type CapitalOfferComponentProps = Omit<CapitalOfferExternalProps, 'core'> & {
    externalCapitalState?: EnhancedCapitalState;
};
