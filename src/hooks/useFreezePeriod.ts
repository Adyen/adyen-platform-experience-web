import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

export const useFreezePeriod = (timeout = 1000, initialState = false) => {
    const [frozen, setFrozen] = useState(initialState);
    const rafId = useRef<ReturnType<typeof requestAnimationFrame>>();
    const timeoutId = useRef<ReturnType<typeof setTimeout>>();

    const freeze = useCallback(() => {
        if (frozen) return;

        timeoutId.current = setTimeout(() => {
            rafId.current = requestAnimationFrame(() => setFrozen(false));
        }, timeout);

        setFrozen(true);
    }, [frozen, timeout]);

    useEffect(() => {
        return () => {
            cancelAnimationFrame(rafId.current!);
            clearTimeout(timeoutId.current!);
            rafId.current = timeoutId.current = null!;
        };
    }, [timeout]);

    return { freeze, frozen } as const;
};

export default useFreezePeriod;
