import { useEffect, useMemo, useRef } from 'preact/hooks';
import useCoreContext from '../core/Context/useCoreContext';
import useUniqueId from './useUniqueId';
import { EMPTY_OBJECT } from '../utils';

export const enum ComponentHeadingType {
    TITLE = 1,
    SUBTITLE = 2,
}

export interface UseComponentHeadingElementProps {
    forwardedToRoot?: boolean;
    headingType?: ComponentHeadingType;
}

export const useComponentHeadingElement = <T extends HTMLElement>(
    { headingType = ComponentHeadingType.TITLE, forwardedToRoot } = EMPTY_OBJECT as UseComponentHeadingElementProps
) => {
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
        if (forwardedToRoot === false) return;

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
    }, [ariaAttribute, componentRef, forwardedToRoot, headingElementId]);

    return { id: headingElementId, ref: headingElementRef } as const;
};

export default useComponentHeadingElement;
