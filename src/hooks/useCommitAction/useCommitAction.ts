import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { ButtonVariant } from '../../components/internal/Button/types';
import { ButtonActionObject } from '../../components/internal/Button/ButtonActions/types';
import { CommitAction, CommitActionProperties, UseCommitActionConfig } from './types';
import useCoreContext from '../../core/Context/useCoreContext';
import { boolOrFalse, EMPTY_OBJECT } from '../../utils';

const useCommitAction = ({
    applyDisabled,
    applyTitle,
    resetDisabled,
    resetTitle,
    onResetAction,
}: UseCommitActionConfig = EMPTY_OBJECT): CommitActionProperties => {
    const { i18n } = useCoreContext();
    const [commitAction, setCommitAction] = useState(CommitAction.NONE);

    const applyAction = useCallback(() => setCommitAction(CommitAction.APPLY), [setCommitAction]);
    const resetAction = useCallback(() => {
        setCommitAction(CommitAction.CLEAR);
        onResetAction && onResetAction();
    }, [setCommitAction, onResetAction]);
    const resetCommitAction = useCallback(() => setCommitAction(CommitAction.NONE), [setCommitAction]);

    const applyButtonAction = useMemo(
        () =>
            ({
                disabled: boolOrFalse(applyDisabled),
                event: applyAction,
                title: applyTitle?.trim() || i18n.get('common.actions.apply.labels.default'),
                variant: ButtonVariant.PRIMARY,
            }) as ButtonActionObject,
        [i18n, applyAction, applyDisabled, applyTitle]
    );

    const resetButtonAction = useMemo(
        () =>
            ({
                disabled: boolOrFalse(resetDisabled),
                event: resetAction,
                title: resetTitle?.trim() || i18n.get('common.actions.reset.labels.default'),
                variant: ButtonVariant.SECONDARY,
            }) as ButtonActionObject,
        [i18n, resetAction, resetDisabled, resetTitle]
    );

    const commitActionButtons = useMemo(() => [applyButtonAction, resetButtonAction] as const, [applyButtonAction, resetButtonAction]);
    const committing = useMemo(() => commitAction !== CommitAction.NONE, [commitAction]);

    useEffect(() => {
        switch (commitAction) {
            case CommitAction.APPLY:
            case CommitAction.CLEAR:
                resetCommitAction();
                break;
        }
    }, [commitAction, resetCommitAction]);

    return { commitAction, commitActionButtons, committing, resetCommitAction } as const;
};

export default useCommitAction;
