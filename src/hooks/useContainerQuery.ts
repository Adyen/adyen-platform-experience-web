import { useEffect, useState } from 'preact/hooks';
import useCoreContext from '../core/Context/useCoreContext';

export const useContainerQuery = <T extends readonly [string, number, { min?: number; max?: number }?]>(query: T) => {
    const { componentRef } = useCoreContext();

    const [width, setWidth] = useState(componentRef.current?.clientWidth || 0);
    const [queryMatch, setQueryMatch] = useState(false);

    useEffect(() => {
        const node = componentRef.current;
        if (!node) return;

        // Create a ResizeObserver instance to watch for changes to the container's size.
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === node) {
                    setWidth(entry.contentRect.width);
                }
            }
        });

        resizeObserver.observe(node);

        const [type, breakpoint, minMax] = query;

        switch (type) {
            case 'up':
                setQueryMatch(width >= breakpoint);
                break;
            case 'down':
                setQueryMatch(width <= breakpoint);
                break;
            case 'only':
                if (minMax) {
                    const { min, max } = minMax;
                    setQueryMatch(max ? width <= max : min ? width >= min : false);
                } else setQueryMatch(width === breakpoint);
                break;
            default:
                setQueryMatch(false);
        }

        // Cleanup the observer on unmount
        return () => {
            resizeObserver.unobserve(node);
            resizeObserver.disconnect();
        };
    }, [componentRef, query, width]);

    return queryMatch;
};

export default useContainerQuery;
