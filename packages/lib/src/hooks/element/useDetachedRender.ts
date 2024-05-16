import { VNode } from 'preact';
import { createPortal } from 'preact/compat';
import { useMemo, useState } from 'preact/hooks';
import type { Reflexable } from '../../primitives/reactive/reflex';
import type { Nullable } from '../../primitives/utils';
import useReflex from '../useReflex';

const useDetachedRender = (callback: (targetElement: Element, ...args: any[]) => VNode | null, targetRef?: Nullable<Reflexable<Element>>) => {
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
