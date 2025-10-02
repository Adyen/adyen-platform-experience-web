import { containerQueries, useResponsiveContainer } from '../../../hooks/useResponsiveContainer';
import { useEffect, useState } from 'preact/hooks';

export const useFilterBarState = () => {
    const isMobileContainer = useResponsiveContainer(containerQueries.down.xs);
    const [showingFilters, setShowingFilters] = useState(!isMobileContainer);
    useEffect(() => {
        setShowingFilters(!isMobileContainer);
    }, [isMobileContainer]);

    return { isMobileContainer, showingFilters, setShowingFilters } as const;
};
