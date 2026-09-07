import { inject } from 'vue';
import { MODAL_CONTEXT_KEY } from './constants';

export function useModalContext() {
    return { withinModal: inject(MODAL_CONTEXT_KEY, false) };
}
