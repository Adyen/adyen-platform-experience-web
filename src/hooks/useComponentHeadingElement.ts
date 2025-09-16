import { useEffect, useRef } from 'preact/hooks';
import useCoreContext from '../core/Context/useCoreContext';
import useUniqueId from './useUniqueId';

export const useComponentHeadingElement = <T extends HTMLElement>() => {
    const { componentRef } = useCoreContext();
    const headingElementId = `heading-${useUniqueId()}`;
    const headingElementRef = useRef<T | null>(null);

    useEffect(() => {
        const componentElement = componentRef.current;
        const headingElementId = headingElementRef.current?.id;

        if (headingElementId && componentElement) {
            componentElement.setAttribute('aria-labeledby', headingElementId);
        }
    }, [componentRef]);

    return { id: headingElementId, ref: headingElementRef } as const;
};

export default useComponentHeadingElement;
