import type { UIElementProps } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import type { EnhancedCapitalState, OnFundsRequestCallback } from '@integration-components/capital/domain';

export type CapitalOfferExternalProps = UIElementProps & {
    onFundsRequest: OnFundsRequestCallback;
    onOfferDismiss?: () => void;
};

export type CapitalOfferComponentProps = Omit<CapitalOfferExternalProps, 'core' | 'appearance'> & {
    capitalState?: EnhancedCapitalState;
    hideSubtitle?: boolean;
    hideTitle?: boolean;
    onTitleChange?: (title: TranslationKey) => void;
};
