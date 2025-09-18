import { useEffect, useMemo, useRef } from 'preact/hooks';
import useCoreContext from '../core/Context/useCoreContext';
import useUniqueId from './useUniqueId';

export const enum ComponentHeadingType {
    TITLE = 1,
    SUBTITLE = 2,
}

export const useComponentHeadingElement = <T extends HTMLElement>(headingType = ComponentHeadingType.TITLE) => {
    const { componentRef } = useCoreContext();
    const headingElementId = `heading-${useUniqueId()}`;
    const headingElementRef = useRef<T | null>(null);

    const ariaAttribute = useMemo(() => {
        switch (headingType) {
            case ComponentHeadingType.TITLE:
                return 'aria-labeledby';
            case ComponentHeadingType.SUBTITLE:
                return 'aria-describedby';
        }
    }, [headingType]);

    useEffect(() => {
        const componentElement = componentRef.current;
        const headingElementId = headingElementRef.current?.id;

        if (headingElementId && componentElement) {
            componentElement.setAttribute(ariaAttribute, headingElementId);

            return () => {
                const currentAttributeValue = componentElement.getAttribute(ariaAttribute);
                if (currentAttributeValue !== headingElementId) return;
                componentElement.removeAttribute(ariaAttribute);
            };
        }
    }, [componentRef, ariaAttribute]);

    return { id: headingElementId, ref: headingElementRef } as const;
};

export default useComponentHeadingElement;
