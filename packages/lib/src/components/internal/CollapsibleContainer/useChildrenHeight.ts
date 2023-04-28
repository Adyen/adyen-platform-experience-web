import { useState, useRef, useEffect } from 'preact/compat';

export const useChildrenHeight = () => {
    const [height, setHeight] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const updateHeight = () => {
            if (ref.current) {
                const newHeight = ref.current.offsetHeight;
                if (newHeight !== height) {
                    setHeight(newHeight);
                }
            }
        };

        const observer = new ResizeObserver(() => {
            updateHeight();
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref, height]);

    return [height, ref] as const;
};
