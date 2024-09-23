import { useCallback } from 'preact/hooks';
import { ALREADY_RESOLVED_PROMISE } from '../../utils';
import type { ReflexAction } from '../../primitives/reactive/reflex';
import useReflex from '../useReflex';

const useFocusCursor = (callback?: ReflexAction<Element>) => {
    const finallyCallback = useCallback(
        ((current, previous) => {
            if (previous instanceof Element) previous.setAttribute('tabindex', '-1');
            if (current instanceof Element) {
                current.setAttribute('tabindex', '0');
                // schedule a microtask to focus the current element
                ALREADY_RESOLVED_PROMISE.then(() => (current as HTMLElement)?.focus());
            }
        }) as ReflexAction<Element>,
        []
    );

    return useReflex<Element>(
        useCallback(
            (current, previous) => {
                try {
                    callback?.(current, previous);
                } finally {
                    finallyCallback(current, previous);
                }
            },
            [callback]
        )
    );
};

export default useFocusCursor;
