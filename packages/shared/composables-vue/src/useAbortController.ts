import { onUnmounted } from 'vue';

/**
 * Keeps at most one request active and cancels it when the owning component unmounts.
 */
export function useAbortController() {
    let abortController: AbortController | undefined;

    const abort = () => {
        abortController?.abort();
    };

    const createSignal = () => {
        abort();
        abortController = new AbortController();
        return abortController.signal;
    };

    onUnmounted(abort);

    return { abort, createSignal } as const;
}

export default useAbortController;
