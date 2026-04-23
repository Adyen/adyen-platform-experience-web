import { useEffect, useRef } from 'preact/hooks';

const useComponentTiming = () => {
    const duration = useRef<number | undefined>(undefined);
    const startTimeRef = useRef(0);

    useEffect(() => {
        // Capture the start time, when component is mounted
        startTimeRef.current = performance.now();
        // Compute the duration, when component is unmounting
        return () => void (duration.current = performance.now() - startTimeRef.current);
    }, []);

    return { duration } as const;
};

export default useComponentTiming;
