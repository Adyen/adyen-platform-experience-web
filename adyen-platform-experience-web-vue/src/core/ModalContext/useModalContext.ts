import { inject } from 'vue';
import type { ModalContextValue } from './types';
import { MODAL_CONTEXT_KEY } from './constants';

export function useModalContext(): ModalContextValue {
    const context = inject<ModalContextValue>(MODAL_CONTEXT_KEY);

    // Default to not within modal if no provider exists
    return context ?? { withinModal: false };
}

export default useModalContext;
