import { useCallback } from 'preact/hooks';
import { InteractionKeyCode } from '@src/components/types';
import { focusIsWithin } from '@src/utils/tabbable';
import { UseListBoxListenersContext } from '../types';

const useListBoxListeners = <T extends any = any>({ dispatch, focusRestorationTarget, ref, state }: UseListBoxListenersContext<T>) => {
    const onClickCapture = useCallback(
        (evt: Event) => {
            let element: HTMLElement | null = evt.target as HTMLElement;

            while (element && element !== evt.currentTarget) {
                const index = Number(element.dataset.index);

                if (Number.isFinite(index)) {
                    dispatch({ type: 'NEXT', arg: index - state.index });
                    dispatch({ type: 'COMMIT' });
                    focusRestorationTarget.current?.focus();
                    evt.preventDefault();
                    break;
                }

                element = element.parentNode as HTMLElement;
            }
        },
        [dispatch, state]
    );

    const onfocusoutCapture = useCallback(
        (evt: FocusEvent) => {
            const activeElement = evt.relatedTarget as Element;

            const shouldEscape =
                activeElement !== focusRestorationTarget.current &&
                !focusIsWithin(ref.current ?? undefined, activeElement) &&
                !focusIsWithin(focusRestorationTarget.current ?? undefined, activeElement);

            shouldEscape && dispatch({ type: 'ESCAPE' });
        },
        [dispatch]
    );

    const onKeyDownCapture = useCallback(
        (evt: KeyboardEvent) => {
            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_UP:
                    dispatch({
                        type: 'NEXT',
                        arg: evt.code === InteractionKeyCode.ARROW_DOWN ? 1 : -1,
                    });
                    break;
                case InteractionKeyCode.END:
                case InteractionKeyCode.HOME:
                    dispatch({
                        type: 'NEXT',
                        arg: (evt.code === InteractionKeyCode.END ? 1 : -1) * Infinity,
                    });
                    break;
                case InteractionKeyCode.ENTER:
                case InteractionKeyCode.ESCAPE:
                case InteractionKeyCode.SPACE:
                    dispatch({
                        type: evt.code === InteractionKeyCode.ESCAPE ? 'ESCAPE' : 'COMMIT',
                    });
                    focusRestorationTarget.current?.focus();
                    break;
                default:
                    return;
            }

            evt.stopPropagation();
            evt.preventDefault();
        },
        [dispatch]
    );

    return { onClickCapture, onfocusoutCapture, onKeyDownCapture } as const;
};

export default useListBoxListeners;
