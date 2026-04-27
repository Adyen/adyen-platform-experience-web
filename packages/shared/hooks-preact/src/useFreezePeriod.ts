import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

export const useFreezePeriod = (timeout = 1000, initialState = false) => {
    const [frozen, setFrozen] = useState(initialState);
    const rafIdRef = useRef<ReturnType<typeof requestAnimationFrame>>();
    const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>();

    const freeze = useCallback(() => {
        if (frozen) return;

        timeoutIdRef.current = setTimeout(() => {
            rafIdRef.current = requestAnimationFrame(() => setFrozen(false));
        }, timeout);

        setFrozen(true);
    }, [frozen, timeout]);

    useEffect(() => {
        return () => {
            cancelAnimationFrame(rafIdRef.current!);
            clearTimeout(timeoutIdRef.current!);
            rafIdRef.current = timeoutIdRef.current = null!;
        };
    }, [timeout]);

    return { freeze, frozen } as const;
};

export default useFreezePeriod;
