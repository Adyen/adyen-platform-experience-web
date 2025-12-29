import { useEffect, useRef } from 'preact/hooks';

const useComponentTiming = () => {
    const duration = useRef<number | undefined>(undefined);
    const startTime = useRef(0);

    useEffect(() => {
        // Capture the start time, when component is mounted
        startTime.current = performance.now();
        // Compute the duration, when component is unmounting
        return () => void (duration.current = performance.now() - startTime.current);
    }, []);

    return { duration } as const;
};

export default useComponentTiming;
