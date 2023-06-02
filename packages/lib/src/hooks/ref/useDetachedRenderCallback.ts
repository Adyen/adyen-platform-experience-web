import { VNode } from 'preact';
import { createPortal } from 'preact/compat';
import { useMemo, useRef } from 'preact/hooks';
import { Reference } from './types';
import useRefWithCallback from './useRefWithCallback';

const useDetachedRenderCallback = (renderContainerRef: Reference<any>, renderCallback: (container: Element, ...args: any[]) => VNode | null) => {
    const $render = useRef<(...args: any[]) => VNode | null>();

    useRefWithCallback(
        useMemo(() => {
            const render =
                (container: any) =>
                (...args: any[]) => {
                    const jsx = renderCallback(container, ...args);
                    return jsx && createPortal(jsx, container);
                };

            return (container: any) => {
                $render.current = container instanceof HTMLElement ? render(container) : undefined;
            };
        }, [renderCallback]),
        renderContainerRef
    );

    return $render.current;
};

export default useDetachedRenderCallback;
