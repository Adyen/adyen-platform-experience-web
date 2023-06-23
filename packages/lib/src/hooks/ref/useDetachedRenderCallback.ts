import { VNode } from 'preact';
import { createPortal } from 'preact/compat';
import { useMemo, useState } from 'preact/hooks';
import useRefWithCallback from './useRefWithCallback';

const useDetachedRenderCallback = (renderCallback: (container: Element, ...args: any[]) => VNode | null, renderContainerRefIdentifier?: string) => {
    const [renderFn, setRenderFn] = useState<(...args: any[]) => VNode | null>();

    const renderContainerRef = useRefWithCallback<Element>(
        useMemo(() => {
            const render =
                (container: Element) =>
                (...args: any[]) => {
                    const jsx = renderCallback(container, ...args);
                    return jsx && createPortal(jsx, container);
                };

            setRenderFn(undefined);

            return container => setRenderFn(container instanceof Element ? () => render(container) : undefined);
        }, [renderCallback, renderContainerRefIdentifier]),
        renderContainerRefIdentifier
    );

    return useMemo(() => [renderFn, renderContainerRef] as const, [renderFn, renderContainerRef]);
};

export default useDetachedRenderCallback;
