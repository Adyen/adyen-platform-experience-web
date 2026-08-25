import { IMissingActionType, UIElementProps } from '@integration-components/types';
import { TranslationKey } from '@integration-components/core';
import { OnFundsRequestCallback } from '@integration-components/capital/domain';

export interface CapitalOverviewProps extends UIElementProps {
    onFundsRequest?: OnFundsRequestCallback;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
}

export type CapitalOverviewComponentProps = CapitalOverviewProps;

export type CapitalComponentState = {
    hasGrants: boolean;
    hasOffer: boolean;
    hasRenewableGrants: boolean;
    state: 'isUnqualified' | 'isPreQualified' | 'hasRequestedGrants' | 'isInUnsupportedRegion';
};

type ActionConfig = {
    buttonLabelKey: TranslationKey;
    eventLabel: string;
    successButtonLabelKey: TranslationKey;
};

export type ActionConfigs = {
    [key in IMissingActionType]: ActionConfig;
};
