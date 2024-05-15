import { useEffect, useMemo, useState } from 'preact/hooks';
import { BREAKPOINTS } from '../../../../constants';
import { ValueOf } from '../../../../utils/types';

export const mediaQueries = {
    up: {
        sm: `(min-width: ${BREAKPOINTS.sm}px)`,
        md: `(min-width: ${BREAKPOINTS.md}px)`,
        lg: `(min-width: ${BREAKPOINTS.lg}px)`,
    },
    down: {
        xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
        sm: `(max-width: ${BREAKPOINTS.md - 1}px)`,
        md: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
    },
    only: {
        xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
        sm: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
        md: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
        lg: `(min-width: ${BREAKPOINTS.lg}px)`,
    },
} as const;

type MediaQueries = typeof mediaQueries;
export type MediaQueryValues = ValueOf<{
    [K in keyof MediaQueries]: ValueOf<MediaQueries[K]>;
}>;

// Generic hook that can be used for other media queries. In this case, we'd need to change the query type later.
export const useMediaQuery = (query: MediaQueryValues) => {
    const list = useMemo(() => window.matchMedia(query), [query]);
    const [matches, setMatches] = useState(list.matches);

    useEffect(() => {
        const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);
        list.addEventListener('change', handleChange);
        return () => list.removeEventListener('change', handleChange);
    }, [list]);

    useEffect(() => {
        setMatches(list.matches);
    }, [list]);

    return matches;
};
