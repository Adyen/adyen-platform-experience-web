import type { IMissingActionType } from '@integration-components/types';
import type { TranslationKey } from '@integration-components/core';

type ActionConfig = {
    buttonLabelKey: TranslationKey;
    eventLabel: string;
    successButtonLabelKey: TranslationKey;
};

export type ActionConfigs = {
    [key in IMissingActionType]: ActionConfig;
};
