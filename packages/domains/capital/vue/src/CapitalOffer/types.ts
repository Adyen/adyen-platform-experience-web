import type { CoreInstance } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import type { EnhancedCapitalState, OnFundsRequestCallback } from '@integration-components/capital/domain';
import type { UIElementProps } from '@integration-components/types';

export type CapitalOfferExternalProps = Omit<UIElementProps, 'ref'> & {
    core: CoreInstance;
    onFundsRequest: OnFundsRequestCallback;
    onOfferDismiss?: () => void;
};

export type CapitalOfferProps = Omit<CapitalOfferExternalProps, 'core'> & {
    capitalState?: EnhancedCapitalState;
    hideSubtitle?: boolean;
    onTitleChange?: (title: TranslationKey) => void;
};
