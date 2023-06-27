import { VNode } from 'preact';
import { createPortal } from 'preact/compat';
import { useMemo, useState } from 'preact/hooks';
import useRefWithCallback from './useRefWithCallback';
import { NullableTrackableRefArgument } from './types';

const useDetachedRenderCallback = (
    renderCallback: (container: Element, ...args: any[]) => VNode | null,
    renderTargetRef?: NullableTrackableRefArgument<Element>
) => {
    const [renderFn, setRenderFn] = useState<(...args: any[]) => VNode | null>();

    const targetRef = useRefWithCallback<Element>(
        useMemo(() => {
            const render =
                (container: Element) =>
                (...args: any[]) => {
                    const jsx = renderCallback(container, ...args);
                    return jsx && createPortal(jsx, container);
                };

            setRenderFn(undefined);

            return container => setRenderFn(container instanceof Element ? () => render(container) : undefined);
        }, [renderCallback, renderTargetRef]),
        renderTargetRef
    );

    return useMemo(() => [renderFn, targetRef] as const, [renderFn, targetRef]);
};

export default useDetachedRenderCallback;
