import { VNode } from 'preact';
import { createPortal } from 'preact/compat';
import { useMemo, useState } from 'preact/hooks';
import useReflex, { NullableReflexable } from '../useReflex';

const useDetachedRender = (callback: (targetElement: Element, ...args: any[]) => VNode | null, targetRef?: NullableReflexable<Element>) => {
    const [render, setRender] = useState<(...args: any[]) => VNode | null>();

    const renderTarget = useReflex<Element>(
        useMemo(() => {
            const render =
                (targetElement: Element) =>
                (...args: any[]) => {
                    const jsx = callback(targetElement, ...args);
                    return jsx && createPortal(jsx, targetElement);
                };

            setRender(undefined);

            return targetElement => setRender(targetElement instanceof Element ? () => render(targetElement) : undefined);
        }, [callback, targetRef]),
        targetRef
    );

    return [render, renderTarget] as const;
};

export default useDetachedRender;
