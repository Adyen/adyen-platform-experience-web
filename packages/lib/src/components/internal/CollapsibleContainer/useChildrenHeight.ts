import { useState, useRef, useEffect, useCallback } from 'preact/hooks';

export const useChildrenHeight = () => {
    const [height, setHeight] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);
    const updateHeight = useCallback(() => {
        if (ref.current) {
            const newHeight = ref.current.offsetHeight;
            if (newHeight !== height) {
                setHeight(newHeight);
            }
        }
    }, [height]);
    useEffect(() => {
        if (ref.current) {
            const observer = new ResizeObserver(() => {
                updateHeight();
            });

            if (ref.current) {
                observer.observe(ref.current);
            }

            return () => {
                if (ref.current) observer.unobserve(ref.current);
            };
        }
    }, []);

    return [height, ref] as const;
};
