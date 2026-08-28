import type { CoreInstance } from '@integration-components/core/vue';
import { UIElementProps } from '@integration-components/types';
import { OnFundsRequestCallback } from '@integration-components/capital/domain';

export interface CapitalOverviewComponentProps extends UIElementProps {
    onFundsRequest?: OnFundsRequestCallback;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
}

export interface CapitalOverviewExternalProps extends CapitalOverviewComponentProps {
    core: CoreInstance;
}
