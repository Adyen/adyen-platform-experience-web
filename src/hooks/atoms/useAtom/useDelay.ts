import { useEffect, useMemo, useRef } from 'preact/hooks';

export interface DelayResult {
    readonly exec: <Fn extends () => unknown>(fn: Fn) => void;
    readonly cancel: () => void;
}

export const useDelay = (delay?: number): DelayResult => {
    const timeoutId = useRef<ReturnType<typeof setTimeout>>();
    const cachedDelay = useRef(0);

    const { cancel, exec } = useMemo(() => {
        const cancel = () => {
            timeoutId.current && clearTimeout(timeoutId.current);
            timeoutId.current = undefined;
        };

        const exec: <Fn extends () => unknown>(fn: Fn) => void = fn => {
            cancel();

            if (cachedDelay.current > 0) {
                timeoutId.current = setTimeout(() => {
                    cancel();
                    fn();
                }, cachedDelay.current);
            } else fn();
        };

        return { cancel, exec } as const;
    }, []);

    useEffect(() => cancel, [cancel]);

    useEffect(() => {
        cachedDelay.current = Math.max(0, Number.parseInt(String(delay), 10) || 0);
    }, [delay]);

    return { cancel, exec } as const;
};

export default useDelay;
