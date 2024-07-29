import { useCallback, useReducer } from 'preact/hooks';
import useReflex from '../../../../hooks/useReflex';
import { InteractionKeyCode } from '../../../types';
import { INITIAL_STATE } from '../DataGrid';

export const useInteractiveDataGrid = ({ totalRows }: { totalRows: number }) => {
    const [state, dispatch] = useReducer<Readonly<{ activeIndex: number; index: number }>, { type: 'ACTIVE' | 'CURRENT'; index: number }>(
        (currentState, action) => {
            const total = totalRows;

            if (total > 1) {
                const nextIndex = action.index;

                if (nextIndex < total && nextIndex! >= 0) {
                    if (action.type === 'ACTIVE') {
                        return Object.freeze({ ...currentState, index: action.index ?? 0, activeIndex: action.index });
                    } else {
                        return Object.freeze({ ...currentState, index: action.index ?? 0, activeIndex: -1 });
                    }
                }
            }
            return currentState;
        },
        INITIAL_STATE
    );

    const ref = useReflex<Element>(
        useCallback(
            current => {
                if (!(current instanceof Element)) return;

                const optionIndex = Number((current as HTMLElement).dataset?.index);

                if ((state.activeIndex === -1 && optionIndex === 0) || optionIndex === state.index) {
                    current.setAttribute('tabindex', '0');
                } else {
                    current.setAttribute('tabindex', '-1');
                }
                if (optionIndex === state.activeIndex) {
                    (current as HTMLElement)?.focus();
                }
            },
            [state.activeIndex, state.index]
        )
    );

    const onKeyDownCapture = useCallback(
        (evt: KeyboardEvent) => {
            const isRow = (evt.target as HTMLElement)?.getAttribute('role') === 'row';
            if (!isRow) {
                if (evt.code === InteractionKeyCode.ARROW_LEFT) {
                    dispatch({
                        type: 'ACTIVE',
                        index: state.index,
                    });
                }
                return;
            }
            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_UP:
                    dispatch({
                        type: 'ACTIVE',
                        index: evt.code === InteractionKeyCode.ARROW_DOWN ? state.index + 1 : state.index - 1,
                    });
                    break;
                case InteractionKeyCode.HOME:
                    dispatch({
                        type: 'ACTIVE',
                        index: 0,
                    });
                    break;
                case InteractionKeyCode.END:
                    dispatch({
                        type: 'ACTIVE',
                        index: totalRows - 1,
                    });
                    break;
                case InteractionKeyCode.ENTER:
                    (evt.currentTarget as HTMLElement)?.click();
                    break;
                default:
                    return;
            }
            evt.stopPropagation();
        },

        [totalRows, state.index]
    );

    const onFocusCapture = useCallback(
        (index: number) => (evt: Event) => {
            const isRow = (evt.target as HTMLElement)?.localName === 'tr';
            if (!isRow || state.index === -1) dispatch({ type: 'CURRENT', index: index });
        },
        [state.index]
    );

    return { listeners: { onKeyDownCapture, onFocusCapture }, ref, activeIndex: state.activeIndex, currentIndex: state.index };
};
