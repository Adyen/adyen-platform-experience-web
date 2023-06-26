import { useCallback } from 'preact/hooks';
import { NamedRefCallback } from './types';
import useRefWithCallback from './useRefWithCallback';

const useFocusCursorElementRef = (withCallback?: NamedRefCallback<Element>) => {
    const finallyCallback = useCallback(
        ((current, previous) => {
            if (previous instanceof Element) {
                previous.setAttribute('tabindex', '-1');
            }
            if (current instanceof Element) {
                current.setAttribute('tabindex', '0');
                // schedule a microtask to focus the current element
                Promise.resolve().then(() => (current as HTMLElement)?.focus());
            }
        }) as NamedRefCallback<Element>,
        []
    );

    return useRefWithCallback<Element>(
        useCallback(
            (current, previous) => {
                try {
                    withCallback?.(current, previous);
                } finally {
                    finallyCallback(current, previous);
                }
            },
            [withCallback]
        )
    );
};

export default useFocusCursorElementRef;
