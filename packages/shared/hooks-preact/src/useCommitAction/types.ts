import { ButtonActionObject } from '@integration-components/ui-primitives-preact/Button/ButtonActions/types';

export enum CommitAction {
    NONE = 0,
    APPLY = 1,
    CLEAR = 2,
}

export interface UseCommitActionConfig {
    applyDisabled?: boolean;
    applyTitle?: string;
    resetDisabled?: boolean;
    resetTitle?: string;
    onResetAction?: () => void;
}

export interface CommitActionProperties {
    readonly commitAction: CommitAction;
    readonly commitActionButtons: readonly [ButtonActionObject, ButtonActionObject];
    readonly committing: boolean;
    readonly resetCommitAction: () => void;
}
