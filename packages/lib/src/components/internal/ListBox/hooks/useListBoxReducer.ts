import { useReducer } from 'preact/hooks';
import { mod } from '@src/utils/common';
import { INITIAL_STATE } from '../constants';
import type { ListBoxState, ListBoxStateDispatchAction } from '../types';

const useListBoxReducer = <T extends any = any>() => {
    return useReducer<ListBoxState<T>, ListBoxStateDispatchAction>((currentState, action) => {
        switch (action.type) {
            case 'EXPAND':
                return Object.freeze({
                    ...currentState,
                    expanded: typeof action.arg === 'boolean' ? action.arg : !currentState.expanded,
                });
            case 'PATCH':
                return Object.freeze({ ...currentState, ...(action.arg as ListBoxState<T>) });
            case 'RESET':
                return INITIAL_STATE as ListBoxState<T>;
            case 'COMMIT':
            case 'ESCAPE':
            case 'NEXT':
                if (currentState.expanded) break;
            default:
                return currentState;
        }

        switch (action.type) {
            case 'COMMIT':
                return Object.freeze({
                    ...currentState,
                    activeIndex: currentState.index,
                    activeOption: currentState.options[currentState.index],
                    expanded: false,
                });
            case 'ESCAPE':
                return Object.freeze({
                    ...currentState,
                    expanded: false,
                    index: currentState.activeIndex,
                });
            case 'NEXT': {
                const modulus = currentState.options.length;

                if (modulus > 1) {
                    const skipOffset = ~~(action.arg ?? 1);
                    const current = currentState.index;

                    if (skipOffset && skipOffset === action.arg) {
                        return Object.freeze({ ...currentState, index: mod(current + skipOffset, modulus) });
                    }
                } else if (currentState.index === INITIAL_STATE.index) {
                    return Object.freeze({ ...currentState, index: 0 });
                }

                return currentState;
            }
        }
    }, INITIAL_STATE as ListBoxState<T>);
};

export default useListBoxReducer;
