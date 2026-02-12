import { useEffect, useState } from 'preact/hooks';
import useCoreContext from '../core/Context/useCoreContext';

export const useContainerQuery = <T extends readonly [string, number, { min?: number; max?: number }?]>(query: T) => {
    const { componentRef } = useCoreContext();
    const [width, setWidth] = useState(componentRef.current?.offsetWidth || 0);
    const [type, breakpoint, minMax] = query;

    let queryMatch = false;

    switch (type) {
        case 'up':
            queryMatch = width >= breakpoint;
            break;
        case 'down':
            queryMatch = width <= breakpoint;
            break;
        case 'only':
            if (minMax) {
                const { min, max } = minMax;
                queryMatch = max ? width <= max : min ? width >= min : false;
            } else {
                queryMatch = width === breakpoint;
            }
            break;
    }

    useEffect(() => {
        const containerElement = componentRef.current;
        if (!containerElement) return;

        // ResizeObserver to watch for changes to container's size.
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === containerElement) {
                    setWidth(containerElement.offsetWidth);
                }
            }
        });

        resizeObserver.observe(containerElement);

        // Cleanup resize observer on unmount
        return () => {
            resizeObserver.unobserve(containerElement);
            resizeObserver.disconnect();
        };
    }, [componentRef]);

    return queryMatch;
};

export default useContainerQuery;
