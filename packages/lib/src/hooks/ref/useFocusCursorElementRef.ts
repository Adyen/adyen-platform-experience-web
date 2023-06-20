import { useCallback, useMemo } from 'preact/hooks';
import { NamedRefCallback } from './types';
import useRefWithCallback from './useRefWithCallback';

const useFocusCursorElementRef = (withCallback?: NamedRefCallback<Element>) => {
    const finallyCallback = useMemo(() => {
        let raf: number | undefined;

        return ((current, previous) => {
            if (raf !== undefined) cancelAnimationFrame(raf as number);
            if (previous instanceof Element) previous.setAttribute('tabindex', '-1');
            if (current instanceof Element) {
                current.setAttribute('tabindex', '0');

                raf = requestAnimationFrame(() => {
                    (current as HTMLElement)?.focus();
                    raf = undefined;
                });
            }
        }) as NamedRefCallback<Element>;
    }, []);

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
