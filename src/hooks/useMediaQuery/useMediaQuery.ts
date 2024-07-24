import { useEffect, useMemo, useState } from 'preact/hooks';

export const useMediaQuery = <T extends string>(query: T) => {
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

export default useMediaQuery;
