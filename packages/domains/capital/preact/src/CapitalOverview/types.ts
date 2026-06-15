import { IGrant, IMissingActionType, UIElementProps } from '@integration-components/types';
import { TranslationKey } from '@integration-components/core';

export interface CapitalOverviewProps extends UIElementProps {
    onFundsRequest?: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
}

export type CapitalComponentState = {
    state: 'isUnqualified' | 'isPreQualified' | 'hasRequestedGrants' | 'isInUnsupportedRegion';
};

export type CapitalOverviewComponentProps = CapitalOverviewProps;

type ActionConfig = {
    buttonLabelKey: TranslationKey;
    eventLabel: string;
    successButtonLabelKey: TranslationKey;
};

export type ActionConfigs = {
    [key in IMissingActionType]: ActionConfig;
};
