import type { UIElementProps } from '@integration-components/core/vue';
import type { CapitalOfferProps as CapitalOfferOptions, CapitalTranslationKey, EnhancedCapitalState } from '@integration-components/capital/domain';

export type CapitalOfferExternalProps = UIElementProps & CapitalOfferOptions;

export type CapitalOfferComponentProps = Omit<CapitalOfferExternalProps, 'core' | 'appearance'> & {
    capitalState?: EnhancedCapitalState;
    hideSubtitle?: boolean;
    onTitleChange?: (title: CapitalTranslationKey) => void;
};
