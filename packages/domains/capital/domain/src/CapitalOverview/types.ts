import { IMissingActionType } from '@integration-components/types';
import { TranslationKey } from '@integration-components/core';

type ActionConfig = {
    buttonLabelKey: TranslationKey;
    eventLabel: string;
    successButtonLabelKey: TranslationKey;
};

export type ActionConfigs = {
    [key in IMissingActionType]: ActionConfig;
};
