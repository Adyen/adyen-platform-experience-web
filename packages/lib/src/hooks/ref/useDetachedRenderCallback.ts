import { VNode } from 'preact';
import { createPortal } from 'preact/compat';
import { useMemo, useRef } from 'preact/hooks';
import useRefWithCallback from './useRefWithCallback';

const useDetachedRenderCallback = (renderCallback: (container: Element, ...args: any[]) => VNode | null, renderContainerRefIdentifier?: string) => {
    const renderFn = useRef<(...args: any[]) => VNode | null>();

    const renderContainerRef = useRefWithCallback<Element>(
        useMemo(() => {
            const render =
                (container: Element) =>
                (...args: any[]) => {
                    const jsx = renderCallback(container, ...args);
                    return jsx && createPortal(jsx, container);
                };

            renderFn.current = undefined;

            return container => {
                renderFn.current = container instanceof Element ? render(container) : undefined;
            };
        }, [renderCallback, renderContainerRefIdentifier]),
        renderContainerRefIdentifier
    );

    return [renderFn.current, renderContainerRef] as const;
};

export default useDetachedRenderCallback;
