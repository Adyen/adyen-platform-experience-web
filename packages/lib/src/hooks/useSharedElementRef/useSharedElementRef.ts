import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import { UseSharedElementRefConfig } from './types';

const useSharedElementRef = ({ shouldRetainCurrentElement, withCurrentElement }: UseSharedElementRefConfig = {}) => {
    const elementRef = useRef<HTMLElement>();
    const elementCandidatesRef = useRef<HTMLElement[]>([]);

    const nominateCandidateElement = useCallback((element?: HTMLElement | null) => {
        if (element != undefined) elementCandidatesRef.current.push(element);
    }, []);

    const updateElementRef = useMemo(() => {
        const retainCurrent = shouldRetainCurrentElement ?? (() => false);
        const withCurrent = withCurrentElement ?? (() => {});

        return () => {
            let currentElement = elementRef.current;

            for (const element of elementCandidatesRef.current) {
                if (currentElement && retainCurrent(currentElement, element)) break;
                currentElement = element;
            }

            elementCandidatesRef.current.length = 0;

            if (currentElement && elementRef.current !== currentElement) {
                withCurrent(elementRef.current = currentElement);
            }
        }
    }, [shouldRetainCurrentElement, withCurrentElement]);

    useEffect(updateElementRef);

    return [elementRef, nominateCandidateElement] as const;
};

export default useSharedElementRef;
