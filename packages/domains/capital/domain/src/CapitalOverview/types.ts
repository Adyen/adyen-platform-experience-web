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

type ActionConfig = {
    buttonLabelKey: TranslationKey;
    eventLabel: string;
    successButtonLabelKey: TranslationKey;
};

export type ActionConfigs = {
    [key in IMissingActionType]: ActionConfig;
};
